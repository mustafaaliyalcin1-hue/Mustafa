import bpy, sys, mathutils
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[-1])
for o in sorted([o for o in bpy.data.objects if o.type=='MESH'],key=lambda o:(o.parent.name if o.parent else '',o.name)):
    pts=[o.matrix_world@mathutils.Vector(c) for c in o.bound_box]
    mn=[round(min(v[i] for v in pts)*1000,1) for i in range(3)]; mx=[round(max(v[i] for v in pts)*1000,1) for i in range(3)]
    print(f"{o.parent.name[-4:] if o.parent else '-':5} {o.name:20} x[{mn[0]:7},{mx[0]:7}] y[{mn[1]:6},{mx[1]:6}] z[{mn[2]:6},{mx[2]:6}] {[m.name for m in o.data.materials]}")
for m in bpy.data.materials:
    b=m.node_tree.nodes.get('Principled BSDF')
    if b: print('MAT',m.name,'metal',round(b.inputs['Metallic'].default_value,2),'rough',round(b.inputs['Roughness'].default_value,2),'trans',round(b.inputs['Transmission Weight'].default_value,2),'alpha',round(b.inputs['Alpha'].default_value,2), m.blend_method if hasattr(m,'blend_method') else '')
