# Telefon modeli içe aktarma + menteşe kurulumu + malzemeler (Blender 5.3, bpy)
import bpy, mathutils, math, os
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
def srgb(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(((x+0.055)/1.055)**2.4 if x>0.04045 else x/12.92 for x in c)+(1,)
def bsdf(m): return m.node_tree.nodes.get('Principled BSDF')
def set_p(m,**k):
    b=bsdf(m)
    for n,v in k.items(): b.inputs[n].default_value=v
def emissive_screen(m,img_path):
    nt=m.node_tree; nt.nodes.clear()
    tc=nt.nodes.new('ShaderNodeTexCoord'); tx=nt.nodes.new('ShaderNodeTexImage'); tx.image=bpy.data.images.load(img_path); tx.interpolation='Cubic'
    em=nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value=0.85
    gl=nt.nodes.new('ShaderNodeBsdfPrincipled'); gl.inputs['Base Color'].default_value=(0,0,0,1); gl.inputs['Roughness'].default_value=0.04
    add=nt.nodes.new('ShaderNodeAddShader'); out=nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(tc.outputs['UV'],tx.inputs['Vector']); nt.links.new(tx.outputs['Color'],em.inputs['Color'])
    nt.links.new(em.outputs[0],add.inputs[0]); nt.links.new(gl.outputs[0],add.inputs[1]); nt.links.new(add.outputs[0],out.inputs[0])
    m['strength_node']=em.name
def remap_uv(objs,matname):
    sel=[]
    for o in objs:
        for mi,m in enumerate(o.data.materials):
            if m and m.name==matname: sel.append((o,mi))
    us=[];vs=[]
    for o,mi in sel:
        uv=o.data.uv_layers.active.data
        for p in o.data.polygons:
            if p.material_index==mi:
                for li in p.loop_indices: us.append(uv[li].uv[0]); vs.append(uv[li].uv[1])
    u0,u1,v0,v1=min(us),max(us),min(vs),max(vs)
    for o,mi in sel:
        uv=o.data.uv_layers.active.data
        for p in o.data.polygons:
            if p.material_index==mi:
                for li in p.loop_indices: uv[li].uv=((uv[li].uv[0]-u0)/(u1-u0),(uv[li].uv[1]-v0)/(v1-v0))

PALETTE={
 'F8':dict(frame='#D6CAE0',frame2='#CDBFD9',back='#9D8BB4',back_rough=0.45,camframe='#D6CAE0',main='f8_main',cover='f8_cover'),
 'U': dict(frame='#2C1A2B',frame2='#241523',back='#211321',back_rough=0.42,camframe='#2C1A2B',main='u_main',cover='u_cover'),
}
def warp_ultra(meshes):
    """Fold8 gövdesini Ultra ölçülerine getirir: köşeleri bozmadan uzat/daralt, 3. lensi ekle."""
    import bmesh
    DZ=0.01725; DX=0.0091; TY=4.1/4.5; PITCH=0.0159; D1=0.0013; ZMID=0.0355
    cam_names={'Camera.007','Camera block.001','Camera block.002','Camera block.003','Flash.003'}
    extra=[]
    # orta lens: alt lensin kopyası
    src=[o for o in meshes if o.name=='Camera.007'][0]
    dup=src.copy(); dup.data=src.data.copy(); bpy.context.scene.collection.objects.link(dup); dup.name='Camera.mid'
    bm=bmesh.new(); bm.from_mesh(dup.data); mw=dup.matrix_world
    kill=[v for v in bm.verts if (mw@v.co).z>0.0385]
    bmesh.ops.delete(bm,geom=kill,context='VERTS'); bm.to_mesh(dup.data); bm.free(); extra.append(dup)
    for o in meshes+extra:
        mw=o.matrix_world; inv=mw.inverted(); iscam=o.name in cam_names or o.name=='Camera.mid'
        for v in o.data.vertices:
            p=mw@v.co
            if p.x>0.040: p.x-=DX
            elif p.x<-0.040: p.x+=DX
            if iscam:
                if o.name=='Camera.mid': p.z+=PITCH
                elif o.name=='Camera.007':
                    if p.z>0.0385: p.z+=PITCH
                elif p.z>ZMID: p.z+=PITCH
                p.z+=D1; p.y-=0.0004
            else:
                p.z+= DZ if p.z>0 else -DZ
                p.y*=TY
            v.co=inv@p
        o.data.update()
    return extra

def load_phone(kind='F8'):
    """kind: 'F8' (Galaxy Z Fold8, Lavender) ya da 'U' (Galaxy Z Fold8 Ultra, Violet Shadow; Fold8 gövdesinden türetilir).
    Her yüklemeden sonra nesne/malzeme adları önekli yapılır ve orijinal malzemeler silinir, böylece sonraki yükleme temiz adlar alır."""
    before=set(bpy.data.objects); mats_before=set(bpy.data.materials)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'models/fold8/source/SAMSUNG Galaxy Z Fold 8 Scf.glb'))
    new=[o for o in bpy.data.objects if o not in before]
    def desc(o): return [o]+[d for c in o.children for d in desc(c)]
    grp=[o for o in new if o.name=='SAMSUNG Galaxy Z Fold8'][0]     # açık gövde
    kept=set(desc(grp))
    for o in new:
        if o not in kept: bpy.data.objects.remove(o,do_unlink=True)
    meshes=[o for o in kept if o.type=='MESH']
    for o in meshes:
        mw=o.matrix_world.copy(); o.parent=None; o.matrix_world=mw
    bpy.data.objects.remove(grp,do_unlink=True)
    bpy.data.orphans_purge(do_local_ids=True,do_linked_ids=True,do_recursive=True)
    HX,HY=0.0304,-0.0100      # menteşe ekseni (z yönünde), ekran düzlemi
    for o in meshes: o.location+=mathutils.Vector((-HX,-HY,0))
    bpy.context.view_layer.update()
    if kind=='U': meshes+=warp_ultra(meshes)
    bpy.context.view_layer.update()
    # malzemeleri bu telefona özel kopyala, orijinalleri sil
    mp={}
    for o in meshes:
        for i,m in enumerate(o.data.materials):
            if m is None: continue
            if m.name not in mp: c=m.copy(); mp[m.name]=c
            o.data.materials[i]=mp[m.name]
    for n,c in mp.items(): c.name=f'{kind}:{n}'
    bpy.data.orphans_purge(do_local_ids=True,do_linked_ids=True,do_recursive=True)
    M={n:c for n,c in mp.items()}
    root=bpy.data.objects.new(kind,None); bpy.context.scene.collection.objects.link(root)
    hinge=bpy.data.objects.new(kind+'_hinge',None); bpy.context.scene.collection.objects.link(hinge)
    spine=bpy.data.objects.new(kind+'_spine',None); bpy.context.scene.collection.objects.link(spine)
    for e in (hinge,spine): e.parent=root
    for o in meshes:
        cx=sum((o.matrix_world@mathutils.Vector(c)).x for c in o.bound_box)/8
        nm=o.name
        if nm=='Cube.001': o.hide_render=True                      # iç menteşe çekirdeği (ekrandan taşıyor)
        if nm in('Cube','Cube.001','samsung-1-logo'): o.parent=spine
        elif cx<0: o.parent=hinge
        else: o.parent=root
        if nm in('Screen','Screen.002','Cube.005'): o.hide_render=True   # yarı saydam ekran camları
        o.name=f'{kind}:{nm}'
    pal=PALETTE[kind]
    set_p(M['Frame (Lavender)'],**{'Base Color':srgb(pal['frame']),'Metallic':1.0,'Roughness':0.16 if kind=='F8' else 0.30})
    set_p(M['Frame (Lavender).001'],**{'Base Color':srgb(pal['frame2']),'Metallic':1.0,'Roughness':0.20 if kind=='F8' else 0.32})
    set_p(M['Glass back'],**{'Base Color':srgb(pal['back']),'Metallic':0.0,'Roughness':pal['back_rough'],'Coat Weight':0.6 if kind=='F8' else 0.35,'Coat Roughness':0.08})
    set_p(M['Glass сamera'],**{'Base Color':srgb('#0B0A14'),'Transmission Weight':0.0,'Roughness':0.02,'Coat Weight':1.0})
    set_p(M['Camera frame'],**{'Base Color':srgb(pal['camframe']),'Metallic':1.0,'Roughness':0.14})
    remap_uv(meshes,M['Screen'].name); remap_uv(meshes,M['Screen_2'].name)
    emissive_screen(M['Screen'],os.path.join(ROOT,f"tex/{pal['main']}.png")); emissive_screen(M['Screen_2'],os.path.join(ROOT,f"tex/{pal['cover']}.png"))
    def set_angle(a,frame=None):
        hinge.rotation_euler=(0,0,math.radians(180-a)); spine.rotation_euler=(0,0,math.radians((180-a)/2))
        if frame is not None:
            hinge.keyframe_insert('rotation_euler',frame=frame); spine.keyframe_insert('rotation_euler',frame=frame)
    return dict(root=root,hinge=hinge,spine=spine,set_angle=set_angle,meshes=meshes,mats=M)
def load_fold8(): return load_phone('F8')

def studio(engine='BLENDER_EEVEE',w=1280,h=720,samples=32):
    sc=bpy.context.scene; sc.render.engine=engine
    if engine=='BLENDER_EEVEE':
        sc.eevee.taa_render_samples=samples
    else:
        sc.cycles.device='CPU'; sc.cycles.samples=samples; sc.cycles.use_denoising=True; sc.cycles.denoiser='OPENIMAGEDENOISE'; sc.cycles.use_adaptive_sampling=True; sc.cycles.max_bounces=6; sc.cycles.transparent_max_bounces=4
    sc.render.resolution_x=w; sc.render.resolution_y=h; sc.render.film_transparent=True
    try: sc.view_settings.view_transform='Khronos PBR Neutral'
    except Exception: sc.view_settings.view_transform='Standard'
    wd=bpy.data.worlds.new('studio'); sc.world=wd; wd.use_nodes=True; nt=wd.node_tree; nt.nodes.clear()
    tc=nt.nodes.new('ShaderNodeTexCoord'); sep=nt.nodes.new('ShaderNodeSeparateXYZ'); ramp=nt.nodes.new('ShaderNodeValToRGB')
    bg=nt.nodes.new('ShaderNodeBackground'); out=nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(tc.outputs['Generated'] if False else tc.outputs['Normal'],sep.inputs[0]); nt.links.new(sep.outputs['Z'],ramp.inputs['Fac'])
    ramp.color_ramp.elements[0].position=0.0; ramp.color_ramp.elements[0].color=srgb('#8E80A8')
    ramp.color_ramp.elements[1].position=1.0; ramp.color_ramp.elements[1].color=srgb('#F4EEFA')
    nt.links.new(ramp.outputs['Color'],bg.inputs['Color']); bg.inputs['Strength'].default_value=0.9; nt.links.new(bg.outputs[0],out.inputs[0])
    def area(name,loc,size,energy,col='#FFFFFF',shape='RECTANGLE',sy=None):
        L=bpy.data.lights.new(name,'AREA'); L.energy=energy; L.shape=shape; L.size=size; L.size_y=sy or size; L.color=srgb(col)[:3]
        o=bpy.data.objects.new(name,L); sc.collection.objects.link(o); o.location=loc
        o.rotation_euler=(mathutils.Vector((0,0,0))-mathutils.Vector(loc)).to_track_quat('-Z','Y').to_euler(); return o
    area('key',(-0.35,-0.45,0.40),0.55,42,'#FFFFFF','RECTANGLE',0.9)
    area('fill',(0.5,-0.3,0.05),0.6,14,'#F2E8FF')
    area('rim',(0.25,0.45,0.30),0.25,40,'#FFF4FA','RECTANGLE',0.9)
    area('top',(0,0,0.6),0.8,18,'#FFFFFF')
    cam=bpy.data.objects.new('cam',bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.lens=70
    return cam
def look_at(cam,target,dist,az,el,roll=0):
    t=mathutils.Vector(target); d=mathutils.Vector((math.sin(math.radians(az))*math.cos(math.radians(el)),-math.cos(math.radians(az))*math.cos(math.radians(el)),math.sin(math.radians(el))))
    cam.location=t+d*dist; q=(t-cam.location).to_track_quat('-Z','Y'); cam.rotation_euler=q.to_euler()
    if roll: cam.rotation_euler.rotate_axis('Z',math.radians(roll))
