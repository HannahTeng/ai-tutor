"""Pre-render classroom voice; runtime has no speech API cost. Requires edge-tts."""
import asyncio,json,pathlib
import edge_tts
root=pathlib.Path(__file__).resolve().parents[1]
lesson=json.loads((root/'src/data/lesson01.json').read_text())
async def main():
    sem=asyncio.Semaphore(3)
    async def one(i,s):
        path=root/f'public/audio/lesson-01-{i+1:02}.mp3'
        if path.exists() and path.stat().st_size>1000:return
        text=s['narration'].replace('{hero}','小兔').replace('{friend}','小熊')
        if s['kind']=='video':text='小朋友们，接下来一起看一段科普动画。安静看一看，找找你认识的小本领吧！'
        async with sem:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text,'zh-CN-XiaoxiaoNeural',rate='+5%',pitch='+6Hz').save(str(path))
                    print('saved',path.name,flush=True);return
                except Exception:
                    if attempt==2:raise
                    await asyncio.sleep(2)
    await asyncio.gather(*(one(i,s) for i,s in enumerate(lesson['slides'])))
asyncio.run(main())
