import bpy, sys
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[-1])
for n in ['Screen.001','Screen.003','Cube.003']:
    o=bpy.data.objects[n]; uv=o.data.uv_layers.active.data
    for mi,m in enumerate(o.data.materials):
        us=[];vs=[]
        for p in o.data.polygons:
            if p.material_index!=mi: continue
            for li in p.loop_indices: us.append(uv[li].uv[0]); vs.append(uv[li].uv[1])
        if us: print(n,m.name,'u',round(min(us),3),round(max(us),3),'v',round(min(vs),3),round(max(vs),3),'polys',sum(1 for p in o.data.polygons if p.material_index==mi))
for im in bpy.data.images: print('IMG',im.name,im.size[:])
