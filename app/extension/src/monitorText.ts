/** Static public HTML only. Never execute scripts or treat access failures as a content change. */
export function monitorText(html:string){
 const cleaned=html.replace(/<!--[^]*?-->/g,' ').replace(/<(script|style|noscript|nav|header|footer|aside)\b[^>]*>[^]*?<\/\1>/gi,' ');
 const main=cleaned.match(/<(article|main)\b[^>]*>([^]*?)<\/\1>/i)?.[2]||cleaned.match(/<body\b[^>]*>([^]*?)<\/body>/i)?.[1]||cleaned;
 const text=main.replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();
 if(text.length<80||/^(access denied|just a moment|verify you are human)/i.test(text))throw new Error('No readable public article. The page may require JavaScript or block automated requests.');
 return text;
}
