'use strict';

var AWS = require('aws-sdk');

class ServerlessPlugin {

    constructor(serverless, options) {

        this.serverless = serverless;
        this.props = this.serverless.service.custom.encryptenv
        this.serverless.service.provider.environment = this.serverless.service.provider.environment || {}
        this.awsConfig = {region: this.serverless.service.provider.region}
        this.ssm = new AWS.SSM(this.awsConfig);
        this.kms = new AWS.KMS(this.awsConfig);

        this.hooks = {
            'before:deploy:createDeploymentArtifacts': this.beforeDeploy.bind(this)
        };

    }

    beforeDeploy() {

        return new Promise((resolve) => {
            return this.encryptSSM().then(data => {
                resolve(data)
            })
        })
    }

    async encryptSSM() {

        return new Promise(async (resolve, reject) => {

            this.props.variables.forEach((k) => {

                let key;

                for (let prop in k) {
                    key = prop
                }

                let params = {
                    Name: k[key].replace("${self:provider.stage}",this.serverless.service.provider.stage),
                    WithDecryption: true
                };

                this.ssm.getParameter(params,  (err, data)=> {
                    if (err) {
                        console.log(err, err.stack);
                        reject(err)
                    } else {
                        let cipherText = data.Parameter.Value
                        this.encrypt(cipherText).then(encrypted=>{
                            this.serverless.service.provider.environment[key] = encrypted
                            resolve(true)
                        })
                    }
                });
            })

        })
    }

    encrypt(plainText) {

        let params = {
            KeyId: this.props.keyArn,
            Plaintext: plainText
        };

        return new Promise(async (resolve, reject) => {

            this.kms.encrypt(params, function (err, data) {
                if (err) {
                    reject(err)
                } else {
                    resolve(data.CiphertextBlob.toString('base64'))
                }
            });

        })

    }


}

module.exports = ServerlessPlugin;
