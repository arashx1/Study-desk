import {test} from 'node:test';
import assert from 'node:assert/strict';
import {monitorText} from '../src/monitorText.ts';
import {compareText} from '../src/changeReview.ts';
const prose='This public research article describes the test method, its scope and the conditions under which the recorded results can be reproduced.';
test('navigation, scripts and whitespace do not produce article alerts',()=>{
 const a=monitorText(`<nav>One</nav><main>${prose}</main><script>secret()</script>`);
 const b=monitorText(`<nav>Different menu</nav><main> ${prose} </main><footer>New date</footer>`);
 assert.equal(a,b);assert.equal(compareText(a,b).changed,false);
});
test('real article edits retain the before and after wording',()=>{
 const a=monitorText(`<article>${prose} The limit is ten units.</article>`);
 const b=monitorText(`<article>${prose} The limit is twenty units.</article>`);
 const diff=compareText(a,b);assert.equal(diff.changed,true);assert.match(diff.before,/ten/);assert.match(diff.after,/twenty/);
});
test('empty or blocked pages cannot replace a saved baseline',()=>{
 assert.throws(()=>monitorText('<body>Access denied</body>'));
 assert.throws(()=>monitorText('<script>application()</script>'));
});
