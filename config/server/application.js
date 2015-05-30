
var path = require('path'),
  rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
  name: "EAP application",
  version: '1.0.0',
  development: {
    domain: 'localhost:3000',
    db: 'mongodb://localhost:27017/eap_dev',
    root: rootPath,
    amazon: {
      s3: {
        bucket: {
          profile: 'eap-profiles-pictures-stg',
        },
        creds: {
          AWS_ACCESS_KEY: "AKIAJJZKTESDUB3UHQLA",
          AWS_SECRET_KEY: "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"
        }
      }
    },
    session: {
      store: {
        type: 'memory'
      },
      saveUninitialized: true,
      resave: true,
    },
    mail: {
      type: "nodemailer",
      auth: {
        user: "dev.sdplan@gmail.com",
        clientId: '312764902862-algco1i4n484psdns9f4796jqnmo70kc.apps.googleusercontent.com',
        clientSecret: 'B6n4XoFoMoNaaB3UKb9AcKJ6',
        refreshToken: '1/yFnDLpBeAJVljxbi0K6ONc_B-dbkt7E-yAQ4Szcx3Kg'
      },
      options: {
        service: "Gmail"
      },
      from: {
        name: "Info",
        email: "dev.sdplan@gmail.com"
      },
    }
  },
  test: {
    domain: 'localhost:3000',
    db: 'mongodb://localhost:27017/eap_test',
    root: rootPath,
  },
  production: {
    domain: 'app.sdplan.dk',
    db: 'mongodb://localhost:27017/eap_prod',
    root: rootPath,
    amazon: {
      s3: {
        bucket: {
          profile: 'eap-profile-pictures',
        }
      }
    },
    session: {
      store: {
        type: 'redis'
      },
      saveUninitialized: false,
      resave: false,
    },
    mail: {
      type: "nodemailer",
      auth: {
        user: "dev.sdplan@gmail.com",
        clientId: '312764902862-algco1i4n484psdns9f4796jqnmo70kc.apps.googleusercontent.com',
        clientSecret: 'B6n4XoFoMoNaaB3UKb9AcKJ6',
        refreshToken: '1/yFnDLpBeAJVljxbi0K6ONc_B-dbkt7E-yAQ4Szcx3Kg'
      },
      options: {
        service: "Gmail"
      },
      from: {
        name: "Info",
        email: "dev.sdplan@gmail.com"
      },
    }
  },
  staging: {
    domain: 'dev.sdplan.dk',
    db: 'mongodb://localhost:27017/eap_prod',
    root: rootPath,
    amazon: {
      s3: {
        bucket: {
          profile: 'eap-profiles-pictures-stg',
        }
      }
    },
    session: {
      store: {
        type: 'redis'
      },
      saveUninitialized: false,
      resave: false,
    },
    mail: {
      type: "nodemailer",
      auth: {
        user: "dev.sdplan@gmail.com",
        clientId: '312764902862-algco1i4n484psdns9f4796jqnmo70kc.apps.googleusercontent.com',
        clientSecret: 'B6n4XoFoMoNaaB3UKb9AcKJ6',
        refreshToken: '1/yFnDLpBeAJVljxbi0K6ONc_B-dbkt7E-yAQ4Szcx3Kg'
      },
      options: {
        service: "Gmail"
      },
      from: {
        name: "Info",
        email: "dev.sdplan@gmail.com"
      },
    }
  }
}
