/*Crypting data*/
const bcrypt  = require('bcrypt');

const User = require('../models/User');

/*Generating TOKENs*/
const jwt = require('jsonwebtoken');

/*MaskData to mask mails*/
const MaskData = require('maskdata');
/* Default Options
    maskWith : "*"
    unmaskedStartCharacters : 3
    unmaskedEndCharacters : 2
    maskAtTheRate : false
    maxMaskedCharactersBeforeAtTheRate : 10
    maxMaskedCharactersAfterAtTheRate : 10
*/
/*Will show only the first 3 characters and the last 2*/

/*Creating accounts when users sign up*/
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: MaskData.maskEmail2(req.body.email),
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

/*Checking users loging in*/
exports.login = (req, res, next) => {
  User.findOne({ email: MaskData.maskEmail2(req.body.email)})
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
  };