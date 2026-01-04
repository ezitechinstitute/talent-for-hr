const db = require('../../../config/db.js');

//roles

//create role
const createRole = async (name,description) =>{
      const sql =`INSERT INTO admin_roles 
        (name,description) VALUES (?,?)`
      const [role] = await db.query(sql,[name,description])  
      return role
}

const getAll = async () =>{
    const sql=`SELECT *
    FROM admin_roles`
    const [result] = await db.query(sql)
    return result
}

const assignRole = async (admin_role_id,userId) =>{
    const sql =`UPDATE admin_users SET admin_role_id = ? WHERE id = ? AND role = 'admin'`
    const [result] = await db.query(sql,[admin_role_id,userId])
    return result
}

const updateRole = async (id,name,description) =>{
     const sql = `UPDATE admin_roles SET name=? , description=? WHERE id=?`
     const [result]=await db.query (sql,[name,description,id])
     return result
}

const deleteRole = async (id) =>{
      const sql = `DELETE FROM admin_roles WHERE id=?`
      const [result]=await db.query(sql,[id])
      return result
}

//module

const createModule = async (name,description) =>{
      const sql =  `INSERT INTO module (name,description) VALUES(?,?)`
      const [result] = await db.query(sql,[name,description])
      return result
}

const getModule = async () =>{
      const sql = `SELECT * FROM module`
      const [result] = await db.query(sql)
      return result
}

//permissions

const assignPermission =async(role_id,module_id,can_create, can_read, can_update, can_delete)=>{
     const sql = `INSERT INTO role_permissions
      (role_id,module_id,can_create, can_read, can_update, can_delete)
      VALUES(?,?,?,?,?,?)`
      const [result] = await db.query(sql,[role_id,module_id,can_create, can_read, can_update, can_delete])
      return result
}

const getPermissions = async()=>{
      const sql = `SELECT * FROM role_permissions`
      const [result]=await db.query(sql)
      return result
}

const update = async(can_create, can_read, can_update, can_delete,id)=>{
      const sql = `UPDATE role_permissions SET  can_create = ?,
       can_read = ?, can_update = ?, can_delete = ? WHERE id=?`
       const [result] = await db.query(sql,[can_create, can_read, can_update, can_delete,id])
       return result
}

const remove =async(id)=>{
       const sql = `DELETE FROM role_permissions WHERE id=?`
       const result = await db.query(sql,[id])
       return result
}


module.exports = {
    createRole,
    getAll,
    assignRole,
    updateRole,
    deleteRole,
    createModule,
    getModule,
    assignPermission,
    getPermissions,
    update,
    remove
}