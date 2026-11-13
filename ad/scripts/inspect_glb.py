import bpy, sys, mathutils
p=sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=p)
for o in bpy.data.objects:
    bb=[o.matrix_world@mathutils.Vector(c) for c in o.bound_box] if o.type=='MESH' else []
    dims=[round(max(v[i] for v in bb)-min(v[i] for v in bb),4) for i in range(3)] if bb else ''
    print(o.type, repr(o.name), 'parent=',o.parent.name if o.parent else None, 'verts=',len(o.data.vertices) if o.type=='MESH' else '', 'dims=',dims, 'mats=',[m.name for m in o.data.materials] if o.type=='MESH' else '')
print('ACTIONS',[a.name for a in bpy.data.actions])
for m in bpy.data.materials:
    b=m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
    print('MAT',m.name, tuple(round(x,3) for x in b.inputs['Base Color'].default_value) if b else '', 'tex=',[n.image.name for n in m.node_tree.nodes if n.type=='TEX_IMAGE'] if m.use_nodes else '')
