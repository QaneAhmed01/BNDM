"use strict";(()=>{var e={};e.id=77,e.ids=[77],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6647:(e,t,a)=>{a.r(t),a.d(t,{headerHooks:()=>g,originalPathname:()=>y,patchFetch:()=>b,requestAsyncStorage:()=>c,routeModule:()=>m,serverHooks:()=>p,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>d});var r={};a.r(r),a.d(r,{POST:()=>u});var n=a(5419),o=a(9108),s=a(9678),i=a(8070);let l=process.env.OPENAI_API_KEY;async function u(e){if(!l)return i.Z.json({error:"Missing OPENAI_API_KEY"},{status:500});let t=await e.json(),a=t.match;t.totalVoters;let r=t.parentNames??"",n=t.dueLabel??"",o=a.left,s=a.right??"",u=a.leftVotes,m=a.rightVotes,c=Math.max(1,u+m),h=`
You are narrating a baby name tournament reveal for parents and their friends and family.
Make it warm, light, and family-friendly.

Names: "${o}" vs "${s}"
Votes: ${u} vs ${m}
Percentages: ${Math.round(u/c*100)}% vs ${Math.round(m/c*100)}%
Total voters counted: ${c}
Parents label: "${r}"
Due or event label: "${n}"

Write:
1) A short 'live commentary' line (1–2 sentences) about this matchup, as if we are watching the bar animation fill up.
2) A tiny 'stat nugget' (1 sentence) that highlights something interesting about the percentages, without being overly analytical.

Rules:
- No jokes about winning/losing children; frame it as "name ideas" only.
- Tone is gentle, excited, and inclusive.
- Do not exaggerate the significance of the vote; make it clear this is just for fun.

Your output must be JSON ONLY with:
{
  "commentary": "string",
  "statNugget": "string"
}
`;try{let e;let t=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${l}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4.1-mini",messages:[{role:"system",content:"You are a warm, playful announcer for a baby name tournament. You always respond with JSON only."},{role:"user",content:h}],temperature:.8,max_tokens:220})});if(!t.ok){let e=await t.text();return console.error("OpenAI error:",e),i.Z.json({error:"OpenAI API error"},{status:500})}let a=await t.json(),r=a.choices?.[0]?.message?.content??'{"commentary":"The votes gently lean in one direction, but both names clearly have fans.","statNugget":"The margin here is small, a reminder that every vote added a little story to this name."}';try{e=JSON.parse(r)}catch(t){console.error("Failed to parse commentary JSON:",t),e={commentary:"The bars climb together on the screen, showing just how many hearts each name has gathered.",statNugget:"The percentages are close, which simply means your shortlist is full of strong favorites."}}return i.Z.json(e)}catch(e){return console.error(e),i.Z.json({error:"Unexpected error"},{status:500})}}let m=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/baby-commentary/route",pathname:"/api/baby-commentary",filename:"route",bundlePath:"app/api/baby-commentary/route"},resolvedPagePath:"/Users/qaneahmed/PregLife/preglife/baby-name-deathmatch/app/api/baby-commentary/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:c,staticGenerationAsyncStorage:h,serverHooks:p,headerHooks:g,staticGenerationBailout:d}=m,y="/api/baby-commentary/route";function b(){return(0,s.patchFetch)({serverHooks:p,staticGenerationAsyncStorage:h})}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[638,206],()=>a(6647));module.exports=r})();