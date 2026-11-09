from pathlib import Path
import re, json, html, subprocess, hashlib, datetime, concurrent.futures,sys
from urllib.parse import urljoin
BASE=Path(__file__).resolve().parents[1]
SITE='https://www.hondapartsnow.com'
STAMP=datetime.datetime.now(datetime.timezone.utc).isoformat()
FOCUS=['valve_rocker_arm','camshaft_timing_belt','cylinder_head','cylinder_head_cover','intake_manifold','exhaust_manifold','crankshaft_piston','clutch_torque_converter']
def fetch(url):
 return subprocess.check_output(['curl','-L','--fail','--silent','--show-error','--max-time','50','--retry','2',url])
def clean(s):return html.unescape(re.sub('<[^>]+>',' ',s)).strip()
def acquire(args):
 variant,category,slug=args;url=f'{SITE}/parts-list/1993-honda-accord--4dr_ex-{variant}_5mt/{category}/{slug}.html'
 raw=fetch(url);s=raw.decode();title=clean(re.search(r'<title[^>]*>(.*?)</title>',s,re.S)[1])
 assert f'{variant.upper()} 5MT' in title,(url,title)
 imgs=list(dict.fromkeys(re.findall(r'(?:https://www.hondapartsnow.com)?(/resources/encry/diagram/[^"<> ]+)',s)))
 imgs=[urljoin(SITE,html.unescape(i).replace('/medium/','/large/')) for i in imgs]
 imgs=list(dict.fromkeys(imgs));assert imgs,(slug,'no diagram')
 parts=[]
 for chunk in re.split(r'<li[^>]*data-id="[^"]+"[^>]*>',s)[1:]:
  links=re.findall(r'<a class="pl-pat-im-link" href="([^"]+)">(.*?)</a>',chunk,re.S)
  call=re.search(r'<span data-code="([^"]*)">',chunk)
  if not links or not call:continue
  detail=re.search(r'<ul class="pl-pat-im-etr">(.*?)</ul>',chunk,re.S)
  actual=list(dict.fromkeys(urljoin(SITE,html.unescape(i)) for i in re.findall(r'src="([^"]+/actual-picture/[^" ]+)"',chunk)))
  qty=re.search(r'Require Quantity:\s*(\d+)',chunk)
  parts.append({'callout':html.unescape(call[1]),'part_number':clean(links[0][1]),'description':clean(links[1][1]) if len(links)>1 else '', 'quantity':int(qty[1]) if qty else None,'details':clean(detail[1]) if detail else '', 'part_url':urljoin(SITE,links[0][0]),'actual_photo_urls':actual})
 assert len(parts)>2,(slug,len(parts))
 assert len(parts)==len(re.findall('data-id=',s)),(slug,'missing rows',len(parts),len(re.findall('data-id=',s)))
 out=BASE/'01_OEM_Diagrams'/variant.upper();out.mkdir(parents=True,exist_ok=True)
 files=[]
 for i,imageurl in enumerate(imgs):
  image=fetch(imageurl);assert image.startswith(b'\x89PNG') or image.startswith(b'\xff\xd8'),(imageurl,'invalid image')
  name=slug+('' if len(imgs)==1 else f'_{i+1}')+'.png';(out/name).write_bytes(image);files.append(str((out/name).relative_to(BASE)))
 entry={'slug':slug,'label':title.split(' - 1993')[0], 'catalog':f'1993 Honda Accord 4 Door EX {variant.upper()} 5MT','target_engine':'F22A6','vehicle_emissions_variant_confirmed':False,'source_url':url,'image_url':imgs[0],'image_urls':imgs,'downloaded_at':STAMP,'image_file':files[0],'image_files':files,'parts_file':str((out/(slug+'.json')).relative_to(BASE)),'part_rows':len(parts),'parts':parts,'source_html_sha256':hashlib.sha256(raw).hexdigest(),'authority_note':'Honda OEM catalogue reproduced by HondaPartsNow; target vehicle KA/KL assignment unresolved.'}
 (out/(slug+'.json')).write_text(json.dumps(entry,ensure_ascii=False,indent=2)+'\n')
 (out/(slug+'.source.html')).write_bytes(raw)
 return {k:v for k,v in entry.items() if k!='parts'}
def main():
 mode=sys.argv[1] if len(sys.argv)>1 else 'baseline'
 targets=[]
 for v in ['ka','kl']:
  indexurl=f'{SITE}/1993-honda-accord--4dr_ex-{v}_5mt-parts.html';s=fetch(indexurl).decode()
  (BASE/'00_Acquisition'/f'index_{v}.html').write_text(s)
  links=list(dict.fromkeys(re.findall(rf'/parts-list/1993-honda-accord--4dr_ex-{v}_5mt/(engine|electrical_exhaust_heater_fuel)/([a-z_]+)\.html',s)))
  for category,slug in links:
   if (mode=='baseline' and slug in FOCUS) or (mode=='all' and (category=='engine' or slug in ['control_box','control_unit','air_cleaner','exhaust_system','wire_harness'])):targets.append((v,category,slug))
 results=[];errors=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
  futures={pool.submit(acquire,t):t for t in targets}
  for f in concurrent.futures.as_completed(futures):
   try:r=f.result();results.append(r);print(r['catalog'],r['slug'],r['part_rows'],flush=True)
   except Exception as e:errors.append({'target':futures[f],'error':str(e)});print('ERROR',futures[f],str(e),flush=True)
 existing=[]
 for p in (BASE/'01_OEM_Diagrams').glob('*/*.json'):
  r=json.loads(p.read_text());existing.append({k:v for k,v in r.items() if k!='parts'})
 manifest={'schema_version':1,'target':{'engine':'F22A6','year':1993,'model':'Honda Accord','body':'4 Door EX sedan','transmission':'5MT','stock':True,'identity_basis':'User confirmed engine stamp and paperwork','market_emissions_variant':None},'scope':'Parallel KA and KL catalogues; neither selected as the confirmed vehicle emissions variant.','downloaded_at':STAMP,'diagrams':sorted(existing,key=lambda e:(e['catalog'],e['slug'])),'errors':errors}
 (BASE/'diagram_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 print('SAVED',len(existing),'diagrams; errors',len(errors),flush=True)
if __name__=='__main__':main()
