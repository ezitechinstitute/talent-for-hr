const rolePermissionModel = require('../../models/admin-model/admin-role-permission/rolePermissionModel.js')

//module

const createModule = async (req,res) =>{
     const {name,description} = req.body
     await rolePermissionModel.createModule(name,description)
     res.status(200).json({
      success:true,
      message:"Created module succesfully"
     })

} 

const getModule = async (req,res) =>{
     const result= await rolePermissionModel.getModule()
     res.status(200).json({
      success:true,
      data:result
     })
}

//permissions

const assignPermissionToRoles = async (req,res) => {
    const {role_id,module_id,can_create, can_read, can_update, can_delete} = req.body
     await rolePermissionModel.assignPermission(role_id,module_id,can_create, can_read, can_update, can_delete)
     res.status(200).json({
        success:true,
        message:"Permission assigned successfully"
     })
}

const getRolePermission = async (req,res) => {
    const permissions = await rolePermissionModel.getPermissions()
    res.status(200).json({
        success:true,
        data:permissions
    })
 
}

const updateRolePermissions = async (req,res) => {
    const {id} = req.params
     const {can_create, can_read, can_update, can_delete} = req.body
     const permissions = await rolePermissionModel.update(can_create, can_read, can_update, can_delete,id)
     res.status(200).json({
        success:true,
        message:"Permission updated successfully"
     })
}

const removePermissionFromRole = async (req,res) => {
    const {id} = req.params
     const permission = await rolePermissionModel.remove(id)
     res.status(200).json({
        success:true,
        message:"Deleted successfully"
     })
}

module.exports =
{
    createModule,
    getModule,
    //permission
    assignPermissionToRoles,
    getRolePermission,
    updateRolePermissions,
    removePermissionFromRole
}