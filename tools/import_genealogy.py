#!/usr/bin/env python3
"""Offline GEDCOM import. Input/backups stay outside the public repository.
Only explicitly deceased, unrestricted people enter the public dataset.
Media must be explicitly approved in the review manifest before publication.
"""
import argparse, hashlib, json, re, zipfile
from pathlib import Path, PurePosixPath

def parse(text):
    roots=[]; stack=[]
    for line in text.splitlines():
        m=re.match(r'^(\d+) (?:(@[^@]+@) )?(\S+)(?: (.*))?$',line)
        if not m: raise ValueError('Malformed GEDCOM line')
        level,xref,tag,value=m.groups(); level=int(level)
        node={'id':xref,'tag':tag,'value':value or '', 'children':[]}
        while stack and stack[-1][0]>=level:stack.pop()
        (stack[-1][1]['children'] if stack else roots).append(node)
        stack.append((level,node))
    return roots

def children(n,tag):return [c for c in n['children'] if c['tag']==tag]
def value(n,tag):return next((c['value'] for c in children(n,tag)),'')
def refs(n,tag):return [c['value'] for c in children(n,tag)]
def restricted(n):return any(c['tag']=='RESN' and c['value'].lower() in ('privacy','confidential','locked') or restricted(c) for c in n['children'])
def deceased(n):return any(c['value'].upper()=='Y' or value(c,'DATE') for c in children(n,'DEAT'))
def event(n,tag):
    c=next(iter(children(n,tag)),None)
    return {'date':value(c,'DATE'),'place':value(c,'PLAC')} if c else None

def run(args):
    raw=Path(args.gedcom).read_bytes(); roots=parse(raw.decode('utf-8-sig'))
    records={n['id']:n for n in roots if n['id']}
    individuals={k:n for k,n in records.items() if n['tag']=='INDI'}
    families={k:n for k,n in records.items() if n['tag']=='FAM'}
    objects={k:n for k,n in records.items() if n['tag']=='OBJE'}
    public={k:n for k,n in individuals.items() if deceased(n) and not restricted(n)}
    manifest=json.loads(Path(args.manifest).read_text()) if args.manifest else {'paths':{},'approved':[]}

    if manifest.get('sourceSha256') and manifest['sourceSha256'] != hashlib.sha256(raw).hexdigest(): raise ValueError('GEDCOM changed: review publication manifest again')
    archive=zipfile.ZipFile(args.media); files={i.filename:i for i in archive.infolist() if not i.is_dir()}
    media_paths={n.removeprefix('data/media/'):n for n in files if n.startswith('data/media/') and '/thumbs/' not in n}
    if not media_paths:media_paths={n:n for n in files if not n.startswith('thumbs/')}
    owners={k:set() for k in objects}
    for k,n in individuals.items():
        for m in refs(n,'OBJE'):owners.setdefault(m,set()).add(k)
    for k,n in families.items():
        for m in refs(n,'OBJE'):owners.setdefault(m,set()).update(refs(n,'HUSB')+refs(n,'WIFE')+refs(n,'CHIL'))
    review=[]; published={}; out=Path(args.output); out.mkdir(parents=True,exist_ok=True)
    for k,n in objects.items():
        source=value(n,'FILE').replace('\\','/'); resolved=manifest.get('paths',{}).get(source,source)
        matches=[p for p in media_paths if p==resolved]
        if not matches:matches=[p for p in media_paths if p.endswith('/'+resolved)]
        path=matches[0] if len(matches)==1 else None
        eligible=bool(owners.get(k)) and owners[k]<=public.keys() and not restricted(n)
        entry={'id':k,'source':source,'resolved':path,'owners':sorted(owners.get(k,set())),'eligible':eligible,'approved':k in manifest.get('approved',[])}
        review.append(entry)
        if not (eligible and entry['approved'] and path):continue
        data=archive.read(media_paths[path]); suffix=PurePosixPath(path).suffix.lower()
        if not suffix:
            suffix='.jpg' if data.startswith(b'\xff\xd8\xff') else '.png' if data.startswith(b'\x89PNG') else ''
        if suffix not in ('.jpg','.jpeg','.png','.pdf'):continue
        if manifest.get('hashes',{}).get(k)!=hashlib.sha256(data).hexdigest():raise ValueError('Media content changed: '+k)
        digest=hashlib.sha256(data).hexdigest(); filename=digest[:20]+suffix
        destination=out/'media'/filename;destination.parent.mkdir(exist_ok=True);destination.write_bytes(data)
        published[k]={'id':k,'url':'/assets/genealogy/media/'+filename,'title':PurePosixPath(path).name,'format':suffix[1:],'kind':'document' if suffix=='.pdf' or path.startswith('Documentos/') or 'CONSEJOS,' in path else 'photo','sha256':digest,'bytes':len(data)}
    people=[]
    for k,n in public.items():
        parents=[]; spouses=[]; kids=[]; mids=refs(n,'OBJE')
        for f in refs(n,'FAMC'):
            family=families.get(f)
            if family and not restricted(family):parents+=refs(family,'HUSB')+refs(family,'WIFE')
        for f in refs(n,'FAMS'):
            family=families.get(f)
            if family and not restricted(family):
                spouses+=refs(family,'HUSB')+refs(family,'WIFE');kids+=refs(family,'CHIL');mids+=refs(family,'OBJE')
        clean=lambda ids:sorted({x for x in ids if x in public and x!=k})
        people.append({'id':k.strip('@'),'name':value(n,'NAME').replace('/','').strip(),'birth':event(n,'BIRT'),'death':event(n,'DEAT'),'parents':[x.strip('@') for x in clean(parents)],'spouses':[x.strip('@') for x in clean(spouses)],'children':[x.strip('@') for x in clean(kids)],'media':list(dict.fromkeys(m for m in mids if m in published))})
    people.sort(key=lambda p:p['name'])
    result={'schema':1,'sourceSha256':hashlib.sha256(raw).hexdigest(),'people':people,'media':published,'stats':{'people':len(people),'media':len(published)}}
    (out/'family.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    if args.report:Path(args.report).write_text(json.dumps({'sourcePeople':len(individuals),'publicPeople':len(people),'excludedPeople':len(individuals)-len(people),'media':review},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'sourcePeople':len(individuals),'publicPeople':len(people),'publishedMedia':len(published),'resolvedMedia':sum(bool(x['resolved']) for x in review),'eligibleMedia':sum(x['eligible'] for x in review)}))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--gedcom',required=True);p.add_argument('--media',required=True);p.add_argument('--output',required=True);p.add_argument('--manifest');p.add_argument('--report');run(p.parse_args())
