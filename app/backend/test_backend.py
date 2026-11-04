import copy
import pytest
from fastapi.testclient import TestClient
import main

@pytest.fixture
def client(tmp_path,monkeypatch):
    monkeypatch.setattr(main,'DB_PATH',tmp_path/'test.sqlite3')
    monkeypatch.delenv('MODEL_API_KEY',raising=False)
    monkeypatch.delenv('MODEL_NAME',raising=False)
    with TestClient(main.app) as client: yield client

def payload():
    return {'workspaceId':'w1','claim':{'id':'c1','workspaceId':'w1','text':'Method A encodes images faster on desktop','scope':'mobile','passageId':'p1','paragraph':'Method A encodes images faster on desktop devices.','revision':1},'passages':[{'id':f'p{i}','workspaceId':'w1','url':url,'title':'source','quote':text,'version':f'v{i}','origin':'live'} for i,url,text in [(1,'https://example.com/a','Method A encodes images faster on desktop'),(2,'https://example.org/b','Method A encodes images slower on older phones')]]}

def test_idempotent_capture_and_conflict(client):
    p=payload();capture={'captureId':'p1','workspaceId':'w1','passage':p['passages'][0]}
    assert client.post('/api/captures',json=capture).json()['duplicate'] is False
    assert client.post('/api/captures',json=capture).json()['duplicate'] is True
    capture['passage']['quote']='different'
    assert client.post('/api/captures',json=capture).status_code==409

def test_workspace_isolation_and_missing_ai(client):
    p=payload();p['passages'][1]['workspaceId']='w2'
    assert client.post('/api/checks',json=p).status_code==400
    r=client.post('/api/checks',json=payload())
    assert r.status_code==503 and r.json()['error']['code']=='ai_unavailable'
    with main.db() as conn: row=conn.execute('SELECT status,error FROM jobs').fetchone()
    assert row['status']=='failed' and row['error']=='ai_unavailable'

def test_ai_check_rejects_gibberish_and_unrelated_claims(client):
    p=payload()
    p['claim']['text']='what is the'
    p['claim']['paragraph']='and the'
    response=client.post('/api/checks',json=p)
    assert response.status_code==400
    assert response.json()['error']['code']=='unclear_claim'
    p=payload()
    p['claim']['text']='What is HTML?'
    p['claim']['paragraph']='HTML describes page structure.'
    p['passages'][0]['title']='HTML guide'
    p['passages'][0]['quote']='HTML gives structure to web pages.'
    assert client.post('/api/checks',json=p).status_code==503
    p=payload()
    p['claim']['text']='The satellite carries a weather instrument'
    assert client.post('/api/checks',json=p).json()['error']['code']=='unrelated_evidence'

def test_ai_check_pairs_scraped_result_with_independent_direct_source(client):
    p=payload()
    p['passages'][1]['url']='https://www.example.com/another-page'
    response=client.post('/api/checks',json=p)
    assert response.status_code==400
    assert response.json()['error']['code']=='independent_source_required'
    p=payload()
    p['passages'][0]['url']='https://www.google.com/search?q=quantum'
    p['passages'][0]['title']='Google AI Overview: quantum mechanics'
    p['passages'][0]['captureKind']='ai-overview'
    response=client.post('/api/checks',json=p)
    assert response.status_code==503
    assert response.json()['error']['code']=='ai_unavailable'

def test_ai_citations_and_job_isolation(client,monkeypatch):
    async def fake(p):
        return main.validate_finding({'status':'different_conditions','rationale':'Desktop and older-phone conditions differ.','passageIds':['p1','p2'],'suggestedText':'A was faster in the desktop test; mobile performance differs.'},p)
    monkeypatch.setattr(main,'model_check',fake)
    response=client.post('/api/checks',json=payload());assert response.status_code==200
    job=response.json()['jobId']
    assert client.get(f'/api/jobs/{job}?workspaceId=w2').status_code==404
    assert client.get(f'/api/jobs/{job}?workspaceId=w1').json()['status']=='completed'
    with pytest.raises(main.Problem): main.validate_finding({'status':'possible_conflict','rationale':'x','passageIds':['p1','invented']},main.CheckRequest.model_validate(payload()))

def test_recovery_and_validation(client):
    with main.db() as conn: conn.execute('INSERT INTO jobs VALUES (?,?,?,?,?,?,?)',('interrupted','w1','running','{}',None,None,main.now()))
    main.initialize()
    assert client.get('/api/jobs/interrupted?workspaceId=w1').json()['error']=='interrupted'
    assert client.post('/api/checks',json={}).status_code==422
    assert client.post('/api/checks',content=b'x'*150001).status_code==413


def test_prior_work_query_validation(client):
    assert client.get('/api/prior-work?q=x').status_code==400


def test_factcheck_missing_key_and_bad_query(client,monkeypatch):
    monkeypatch.delenv('GOOGLE_FACTCHECK_API_KEY',raising=False)
    assert client.get('/api/fact-check?q=x').status_code==400
    response=client.get('/api/fact-check?q=example+claim')
    assert response.status_code==503
    assert response.json()['error']['code']=='factcheck_unavailable'


def test_rag_scope_and_missing_provider(client):
    p=payload()
    request={'workspaceId':'w1','question':'What did the sources say about faster desktop encoding?','passages':p['passages']}
    assert client.post('/api/ask',json=request).status_code==503
    request['question']='What is HTML?'
    request['passages'][0]['title']='HTML guide'
    request['passages'][0]['quote']='HTML gives structure to web pages.'
    assert client.post('/api/ask',json=request).status_code==503
    request['passages']=payload()['passages']
    request['question']='4wtkmrmkw'
    assert client.post('/api/ask',json=request).json()['error']['code']=='unrelated_question'
    request['question']='What do the sources say about distant galaxies?'
    assert client.post('/api/ask',json=request).json()['error']['code']=='unrelated_question'
    request['question']='Summarize the key evidence collected'
    assert client.post('/api/ask',json=request).status_code==503
    request['passages'][0]['workspaceId']='other'
    assert client.post('/api/ask',json=request).status_code==400


def test_native_gemini_request_and_json(monkeypatch):
    import asyncio, httpx
    original=httpx.AsyncClient
    def handler(request):
        assert request.url.path=='/v1beta/models/gemini-3.8-flash:generateContent'
        body=__import__('json').loads(request.content)
        assert body['generationConfig']['responseMimeType']=='application/json'
        assert body['contents'][0]['parts'][0]['text']=='saved evidence'
        return httpx.Response(200,json={'candidates':[{'content':{'parts':[{'text':'private reasoning','thought':True},{'text':'{"answer":"Grounded answer","citations":["p1"]}'}]}}]})
    monkeypatch.setattr(main.httpx,'AsyncClient',lambda **kwargs:original(transport=httpx.MockTransport(handler),**kwargs))
    result=asyncio.run(main.provider_json('https://generativelanguage.googleapis.com/v1beta/openai','test-key','gemini-3.8-flash','Use only evidence','saved evidence'))
    assert result=={'answer':'Grounded answer','citations':['p1']}


def test_task_routing_requires_own_key_for_custom_host(monkeypatch):
    monkeypatch.setenv('MODEL_API_KEY','default-secret')
    monkeypatch.setenv('MODEL_NAME','default-model')
    monkeypatch.setenv('SUMMARY_BASE_URL','https://example.com/v1')
    monkeypatch.delenv('SUMMARY_API_KEY',raising=False)
    assert main.task_provider('summary')[0]==''
    monkeypatch.setenv('SUMMARY_API_KEY','summary-secret')
    monkeypatch.setenv('SUMMARY_MODEL_NAME','summary-model')
    assert main.task_provider('summary')==('summary-secret','summary-model','https://example.com/v1')
    assert main.AskRequest.model_validate({'workspaceId':'w','question':'q','passages':[dict(payload()['passages'][0],workspaceId='w')]}).task=='answer'


def test_web_search_missing_key_and_validation(client,monkeypatch):
    monkeypatch.delenv('BRAVE_SEARCH_API_KEY',raising=False)
    assert client.get('/api/web-search?q=x').status_code==400
    result=client.get('/api/web-search?q=research+claim')
    assert result.status_code==503
    assert result.json()['error']['code']=='search_not_configured'
