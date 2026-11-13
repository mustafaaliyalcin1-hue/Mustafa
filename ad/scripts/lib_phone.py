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

def load_fold8(name='F8'):
    """Fold8: açık gövde grubunu alır, menteşe kurar. Döndürür: dict(root, hinge, spine, angle setter)"""
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'models/fold8/source/SAMSUNG Galaxy Z Fold 8 Scf.glb'))
    new=[o for o in bpy.data.objects if o not in before]
    keep=[o for o in new if o.name=='SAMSUNG Galaxy Z Fold8']
    grp=keep[0]
    def desc(o): return [o]+[d for c in o.children for d in desc(c)]
    kept=set(desc(grp))
    for o in new:
        if o not in kept: bpy.data.objects.remove(o,do_unlink=True)
    meshes=[o for o in kept if o.type=='MESH']
    # dünyaya göre sabitle, parentları çöz
    for o in meshes:
        mw=o.matrix_world.copy(); o.parent=None; o.matrix_world=mw
    bpy.data.objects.remove(grp,do_unlink=True)
    HX,HY=0.0304,-0.0100   # menteşe ekseni (z yönünde), ekran düzlemi
    W=0.0807*2-0.0002       # açık genişlik
    # kök: menteşe merkezde, telefon gövde ortası orijinde
    root=bpy.data.objects.new(name,None); bpy.context.scene.collection.objects.link(root)
    hinge=bpy.data.objects.new(name+'_hinge',None); bpy.context.scene.collection.objects.link(hinge)
    spine=bpy.data.objects.new(name+'_spine',None); bpy.context.scene.collection.objects.link(spine)
    off=mathutils.Vector((-HX,-HY,0))
    for o in meshes: o.location+=off
    bpy.context.view_layer.update()
    for e in (hinge,spine): e.parent=root
    for o in meshes:
        cx=sum((o.matrix_world@mathutils.Vector(c)).x for c in o.bound_box)/8
        nm=o.name
        if nm=='Cube.001': o.hide_render=True
        if nm in ('Cube','Cube.001','samsung-1-logo'): o.parent=spine
        elif cx<0: o.parent=hinge
        else: o.parent=root
    # malzemeler
    M=bpy.data.materials
    for n in ('Frame (Lavender)','Frame (Lavender).001'):
        if n in M: set_p(M[n],**{'Base Color':srgb('#CDBFD9') if n.endswith('001') else srgb('#D6CAE0'),'Metallic':1.0,'Roughness':0.16})
    if 'Glass back' in M: set_p(M['Glass back'],**{'Base Color':srgb('#9D8BB4'),'Metallic':0.0,'Roughness':0.45,'Coat Weight':0.6,'Coat Roughness':0.08})
    if 'Glass screen' in M: set_p(M['Glass screen'],**{'Base Color':(0,0,0,1),'Transmission Weight':0.0,'Roughness':0.03,'Alpha':0.10}); M['Glass screen'].surface_render_method='BLENDED' if hasattr(M['Glass screen'],'surface_render_method') else None
    if 'Glass сamera' in M: set_p(M['Glass сamera'],**{'Base Color':srgb('#0B0A14'),'Transmission Weight':0.0,'Roughness':0.02,'Coat Weight':1.0})
    if 'Camera frame' in M: set_p(M['Camera frame'],**{'Base Color':srgb('#D6CAE0'),'Metallic':1.0,'Roughness':0.14})
    for o in meshes:
        if [m.name for m in o.data.materials if m]==['Glass screen','USB type c.001'] or (o.name in('Cube.005',)):
            o.hide_render=True
    remap_uv(meshes,'Screen'); remap_uv(meshes,'Screen_2')
    emissive_screen(M['Screen'],os.path.join(ROOT,'tex/f8_main.png')); emissive_screen(M['Screen_2'],os.path.join(ROOT,'tex/f8_cover.png'))
    def set_angle(a,frame=None):
        hinge.rotation_euler=(0,0,math.radians(180-a)); spine.rotation_euler=(0,0,math.radians((180-a)/2))
        if frame is not None:
            hinge.keyframe_insert('rotation_euler',frame=frame); spine.keyframe_insert('rotation_euler',frame=frame)
    return dict(root=root,hinge=hinge,spine=spine,set_angle=set_angle,meshes=meshes)

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
    area('key',(-0.35,-0.45,0.40),0.55,55,'#FFFFFF','RECTANGLE',0.9)
    area('fill',(0.5,-0.3,0.05),0.6,14,'#F2E8FF')
    area('rim',(0.25,0.45,0.30),0.25,40,'#FFF4FA','RECTANGLE',0.9)
    area('top',(0,0,0.6),0.8,18,'#FFFFFF')
    cam=bpy.data.objects.new('cam',bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.lens=70
    return cam
def look_at(cam,target,dist,az,el,roll=0):
    t=mathutils.Vector(target); d=mathutils.Vector((math.sin(math.radians(az))*math.cos(math.radians(el)),-math.cos(math.radians(az))*math.cos(math.radians(el)),math.sin(math.radians(el))))
    cam.location=t+d*dist; q=(t-cam.location).to_track_quat('-Z','Y'); cam.rotation_euler=q.to_euler()
    if roll: cam.rotation_euler.rotate_axis('Z',math.radians(roll))
