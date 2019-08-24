//====================
// Dependencies
//====================
// - None -

class rolesDAO
{
    async getRoles()
    {
        const SQL = `SELECT * FROM Roles`;    
        return await fw.db.execute('local',SQL);
    }
}

module.exports = new rolesDAO();