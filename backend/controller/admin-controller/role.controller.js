const rolePermissionModel = require('../../models/admin-model/admin-role-permission/rolePermissionModel.js')

const createRole = async (req,res)=>{
        const {name,description}=req.body
        await rolePermissionModel.createRole(name,description)
        res.status(200).json({
        success:true,
        message:"Created role successfully"
      })
   
}

const getAllRoles = async (req,res)=>{
     const roles=await rolePermissionModel.getAll()
     res.status(200).json({
        success:true,
        message:"Fetched roles successfully",
        data:roles
     })
}

  const assignRoles = async (req,res) =>{
    const{userId}=req.params
    const {admin_role_id} = req.body
     await rolePermissionModel.assignRole(admin_role_id,userId)
       res.status(200).json({
        success:true,
        message:"Assigned roles to user successfully"
     })
  }

const updateRole= async (req,res)=>{
        const {id}=req.params
        const {name,description}=req.body
       await rolePermissionModel.updateRole(id,name,description)
      res.status(200).json({
        success:true,
        message:"Updated role successfully"
      })
}

const deleteRole = async (req,res)=>{
        const {id}=req.params
       await rolePermissionModel.deleteRole(id)
       res.status(200).json({
        success:true,
        message:"Deleted role successfully"
       })
}

module.exports = 
{
    createRole,
    getAllRoles,
    assignRoles,
    updateRole,
    deleteRole
}