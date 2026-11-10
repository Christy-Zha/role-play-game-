import pathlib
ROOT=pathlib.Path(__file__).resolve().parent
src=ROOT/'src'
css=(src/'style.css').read_text(encoding='utf-8')
# Three.js（3D 工具库，MIT 协议）单独放一个 <script>，在游戏代码之前加载
three='<script>\n'+(src/'vendor'/'three.min.js').read_text(encoding='utf-8')+'\n</script>\n'
js='(function(){\n'+'\n'.join((src/f).read_text(encoding='utf-8') for f in ['art.js','pixel.js','story.js','art2.js','hd.js','items.js','story2.js','events.js','quests.js','content2.js','bond.js','branch.js','world.js','battle.js','sweep.js','minigame.js','clan.js','surprise.js','sfx.js','art3.js','art4.js','elements.js','craft.js','fate.js','jianghu.js','renwu.js','renjian.js','zongmen.js','boss.js','rival.js','ceremony.js','vol1.js','vol2.js','vol3.js','chart.js','vol4.js','vol5.js','vol6.js','vol7.js','vol8.js','vol9.js','vol10.js','vol11.js','vol12.js','vol13.js','after.js','canon.js','timeline.js','meta.js','pets.js','xuhua.js','kaizong.js','fun.js','stage3d.js','game.js'])+'\n})();'
body='''<div id="app">
  <header class="top">
    <div class="who"><div class="nm" id="hName"></div><div class="rl" id="hRealm"></div></div>
    <div class="res"><div><span class="lbl">灵石</span><b id="hStones">0</b></div><div><span class="lbl">道心</span><b id="hKarma">本心</b></div></div>
    <button id="saveOpen" type="button" aria-label="打开存档与备份" aria-pressed="false" disabled>存档</button>
  </header>
  <div class="qi" aria-hidden="true"><div class="qif" id="hQi"></div></div>
  <main id="view"></main>
  <nav class="tabs" role="tablist">
    <button class="tab" data-tab="world" role="tab"><span class="g">行</span><span class="l">江湖</span><i class="dot" id="dotSta" hidden></i></button>
    <button class="tab" data-tab="cult" role="tab"><span class="g">修</span><span class="l">修炼</span></button>
    <button class="tab" data-tab="jade" role="tab" id="tabJade"><span class="g">玉</span><span class="l">玉简</span></button>
    <button class="tab" data-tab="bag" role="tab"><span class="g">囊</span><span class="l">行囊</span></button>
    <button class="tab" data-tab="clan" role="tab" id="tabClan"><span class="g">族</span><span class="l">家族</span></button>
    <button class="tab" data-tab="story" role="tab"><span class="g">卷</span><span class="l">卷宗</span><i class="dot" id="dotStory" hidden></i></button>
  </nav>
</div>
<div id="toasts"></div>
<div id="bt" hidden></div>
<div id="miniGameOverlay" hidden></div>
<div id="ov" hidden></div>
'''
fonts='<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700&display=swap">\n'
art='<title>灵潮修仙录</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'+fonts+'<style>\n'+css+'\n</style>\n'+body+three+'<script>\n'+js+'\n</script>\n'
(ROOT/'build'/'lingchao_artifact.html').parent.mkdir(exist_ok=True);(ROOT/'build'/'lingchao_artifact.html').write_text(art,encoding='utf-8')
head='''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="灵潮修仙录">
<meta name="theme-color" content="#16140f">
<title>灵潮修仙录</title>
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="art/icon-180.png">
'''+fonts+'<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}[hidden]{display:none!important}\n'+css+'\n</style>\n</head>\n<body>\n'+body+three+'<script>\n'+js+'\n</script>\n</body>\n</html>\n'
(ROOT/'index.html').write_text(head,encoding='utf-8')
print('ok',len(art))
