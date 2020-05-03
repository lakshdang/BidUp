module.exports = function(pool){
	return{
		addUser: function(userInfo, callback){
			email = userInfo.email
			isAdmin = false 
			if(userInfo.isAdmin!=undefined && userInfo.isAdmin=='isAdmin')isAdmin = true;
			pool.query('Select * FROM Users WHERE email=?',[email], function(error, results, fields){
				if(error)return callback(error);
				if(results.length>0)return callback(null, false)
				pool.query('INSERT INTO Users(email, Admin) VALUES (?)', [[email, isAdmin]], function(error, results, fields){
					if(error)return callback(error);
					return callback(null, true)
				})
			})
		}
	}
}