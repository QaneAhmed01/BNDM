"use strict";(()=>{var e={};e.id=785,e.ids=[785],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2943:(e,t,a)=>{a.r(t),a.d(t,{headerHooks:()=>d,originalPathname:()=>g,patchFetch:()=>f,requestAsyncStorage:()=>l,routeModule:()=>p,serverHooks:()=>c,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>y});var r={};a.r(r),a.d(r,{POST:()=>u});var n=a(5419),o=a(9108),s=a(9678),i=a(8070);let m=process.env.OPENAI_API_KEY;async function u(e){if(!m)return i.Z.json({error:"Missing OPENAI_API_KEY"},{status:500});let{roundLabel:t,nameA:a,nameB:r,votesA:n,votesB:o}=await e.json(),s=Math.max(1,n+o),u=`
You are the playful announcer for a baby name tournament.

Round: "${t}"
Name A: "${a}" with ${n} votes (${Math.round(n/s*100)}%)
Name B: "${r}" with ${o} votes (${Math.round(o/s*100)}%)

Your job:
1) Create a short headline (max 10 words) like a commentator might say.
2) Create 1–2 friendly, warm sentences summarising what happened in the round, aimed at expectant parents and their friends.
3) Create one stats line that directly mentions the percentage split, for example:
   "36% of your voters preferred Luna over Diana."

Important:
- Keep the tone supportive, light and celebratory.
- No negativity, no judging the losing name.
- Do not mention pregnancy complications, medical advice, or anything sensitive.
- Only talk about names, preferences and votes.

Output JSON ONLY (no extra text) with this shape:
{
  "headline": string,
  "summary": string,
  "statsLine": string
}
`;try{let e;let t=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${m}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4.1-mini",messages:[{role:"system",content:"You are a gentle, playful announcer for a baby name tournament, and you always respond with valid JSON matching the requested schema."},{role:"user",content:u}],temperature:.9,max_tokens:260})});if(!t.ok){let e=await t.text();return console.error("OpenAI error:",e),i.Z.json({error:"OpenAI API error"},{status:500})}let a=await t.json(),r=a.choices?.[0]?.message?.content??'{"headline":"A close and cosy matchup","summary":"Both names had plenty of love, but one nudged ahead in the votes.","statsLine":"52% of your voters slightly preferred one name this time."}';try{e=JSON.parse(r)}catch(t){console.error("Failed to parse JSON from OpenAI:",t),e={headline:"A sweet little victory",summary:"Both names clearly have fans, but one name gently stepped forward.",statsLine:"Just over half of your voters leaned towards the winning name."}}return i.Z.json(e)}catch(e){return console.error(e),i.Z.json({error:"Unexpected error"},{status:500})}}let p=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/commentary/route",pathname:"/api/commentary",filename:"route",bundlePath:"app/api/commentary/route"},resolvedPagePath:"/Users/qaneahmed/PregLife/preglife/baby-name-deathmatch/app/api/commentary/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:l,staticGenerationAsyncStorage:h,serverHooks:c,headerHooks:d,staticGenerationBailout:y}=p,g="/api/commentary/route";function f(){return(0,s.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:h})}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[638,206],()=>a(2943));module.exports=r})();