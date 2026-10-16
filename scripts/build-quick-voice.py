"""One-time demo narration rendering. Requires edge-tts and exported quickStages JSON."""
import asyncio,json,pathlib,sys
import edge_tts
root=pathlib.Path(__file__).resolve().parents[1]
async def main():
    stages=json.loads(pathlib.Path(sys.argv[1]).read_text())
    sem=asyncio.Semaphore(3)
    async def one(i,s):
        p=root/f'public/audio/quick-demo-{i+1}.mp3'
        if p.exists() and p.stat().st_size>1000:return
        async with sem:
            await edge_tts.Communicate(s['narration'],'zh-CN-XiaoxiaoNeural',rate='+5%',pitch='+6Hz').save(str(p))
            print('saved',p.name,flush=True)
    await asyncio.gather(*(one(i,s) for i,s in enumerate(stages)))
asyncio.run(main())
