'use strict';

var AWS = require('aws-sdk');

class ServerlessPlugin {

    constructor(serverless, options) {

        this.serverless = serverless;
        this.props = this.serverless.service.custom.env
        this.serverless.service.provider.environment = this.serverless.service.provider.environment || {}
        this.awsConfig = {region: this.serverless.service.provider.region}
        this.ssm = new AWS.SSM(this.awsConfig);
        this.kms = new AWS.KMS(this.awsConfig);
        this.global = !this.props.functions

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

    resolveValues(variables){

        return new Promise(async (resolve, reject) => {

            var list = []

            await this.asyncForEach(variables,async (k,i) => {

                let key;

                for (let prop in k) {
                    key = prop
                }

                if(k[key].indexOf("encrypt:") === -1 && k[key].indexOf("ssm:") === -1 ){
                    list.push({key,value:k[key]})
                    return
                }

                let isEncrypted = k[key].indexOf("encrypt:") !== -1
                let keyName = k[key].replace("${self:provider.stage}",this.serverless.service.provider.stage)
                    .replace("encrypt:","")
                    .replace("ssm:","")

                let params = {
                    Name: keyName,
                    WithDecryption:isEncrypted
                };

                await this.getParameter(params,isEncrypted).then(value=>{
                    list.push({key,value})
                }).catch(err=>{
                    reject(err)
                });

            })
            resolve(list)
        })
    }

    async getParameter(params,encrypt){
        return new Promise(async (resolve, reject) => {
            await this.ssm.getParameter(params,  async(err, data)=> {
                if (err) {
                    console.log(err, err.stack);
                    reject(err)
                } else {
                    let cipherText = data.Parameter.Value
                    if(!encrypt){
                        resolve(data.Parameter.Value)
                        return
                    }
                    await this.encrypt(cipherText).then(value=>{
                        resolve(value)
                    })
                }
            });

        })
    }

    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    async encryptSSM() {

        return new Promise(async (resolve, reject) => {

            if (this.global){
                await this.resolveValues(this.props.variables).then(result=>{
                    result.forEach(i=>{
                        this.serverless.service.provider.environment[i.key] = i.value
                    })
                    resolve(true)
                })
                return
            }
            await this.asyncForEach(this.props.functions,async(f)=>{
                this.serverless.service.functions[f.name].environment = this.serverless.service.functions[f.name].environment || {}
                await this.resolveValues(f.variables).then(result=>{
                    result.forEach(v=>{
                        this.serverless.service.functions[f.name].environment[v.key] = v.value
                    })
                })
            })

            resolve(true)

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
