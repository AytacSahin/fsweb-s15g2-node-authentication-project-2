const { JWT_SECRET } = require("../secrets"); // bu secreti kullanın!
const jwt = require("jsonwebtoken");
const { goreBul } = require("../users/users-model");
const bcrypt = require("bcryptjs");

const sinirli = (req, res, next) => {
  /*
    Eğer Authorization header'ında bir token sağlanmamışsa:
    status: 401
    {
      "message": "Token gereklidir"
    }

    Eğer token doğrulanamıyorsa:
    status: 401
    {
      "message": "Token gecersizdir"
    }

    Alt akıştaki middlewarelar için hayatı kolaylaştırmak için kodu çözülmüş tokeni req nesnesine koyun!
  */
  try {
    let authHeader = req.headers.authorizaiton;
    if (authHeader) {
      res.status(401).json({ message: "Token gereklidir" });
    } else {
      jwt.verify(authHeader, JWT_SECRET, (error, decodedToken) => {
        if (error) {
          res.status(401).json({ message: "Token gecersizdir" });
        } else {
          req.decodedToken = decodedToken;
          next();
        }
      })
    }
  } catch (error) {
    next(error);
  }
}

const sadece = role_name => (req, res, next) => {
  /*
    
  Kullanıcı, Authorization headerında, kendi payloadu içinde bu fonksiyona bağımsız değişken olarak iletilen 
  rol_adı ile eşleşen bir role_name ile bir token sağlamazsa:
    status: 403
    {
      "message": "Bu, senin için değil"
    }

    Tekrar authorize etmekten kaçınmak için kodu çözülmüş tokeni req nesnesinden çekin!
  */
  try {
    if (req.decodedToken.role_name === role_name) {
      next()
    } else {
      res.status(403).json({ message: "Bu, senin için değil" });
    }
  } catch (error) {

  }
}


const usernameVarmi = async (req, res, next) => {
  /*
    req.body de verilen username veritabanında yoksa
    status: 401
    {
      "message": "Geçersiz kriter"
    }
  */
  try {
    let existUser = await goreBul(req.body.username);
    if (existUser) {
      let currentUser = existUser[0];
      let isPasswordMatch = bcrypt.compareSync(req.body.password, currentUser.password);
      if (!isPasswordMatch) {
        res.status(401).json({ message: "Geçersiz kriter" });
      } else {
        req.currentUser = currentUser;
        next()
      }
    }
  } catch (error) {
    next(error)
  }
}


const rolAdiGecerlimi = (req, res, next) => {
  /*
    Bodydeki role_name geçerliyse, req.role_name öğesini trimleyin ve devam edin.

    Req.body'de role_name eksikse veya trimden sonra sadece boş bir string kaldıysa,
    req.role_name öğesini "student" olarak ayarlayın ve isteğin devam etmesine izin verin.

    Stringi trimledikten sonra kalan role_name 'admin' ise:
    status: 422
    {
      "message": "Rol adı admin olamaz"
    }

    Trimden sonra rol adı 32 karakterden fazlaysa:
    status: 422
    {
      "message": "rol adı 32 karakterden fazla olamaz"
    }
  */
}

module.exports = {
  sinirli,
  usernameVarmi,
  rolAdiGecerlimi,
  sadece,
}
