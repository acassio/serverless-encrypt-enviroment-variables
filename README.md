# serverless-encrypt-enviroment-variables
Serverless plugin that get encrypted ssm parameters (kms) and keep them encrypted on lambda console with a valid hash.

add plugin:

```yaml
plugins:
  - serverless-encrypt-enviroment-variables
``` 

usage with global variables:
```yaml
custom:
  env:
    keyArn: "arn:aws:kms......"
    variables:
       - VAR1: "encrypt:/VARIABLE/ENCRYPTED"
       - VAR2: "ssm:/VARIABLE/DECRYPTED"
       - VAR3: "NORMAL_VALUE"   
```

usage with function local variables:
```yaml
custom:
  env:
    keyArn: "arn:aws:kms......"
    functions:
       - name: "example1"
         variables:
            - VAR1: "encrypt:/VARIABLE/ENCRYPTED"
            - VAR2: "ssm:/VARIABLE/DECRYPTED"
            - VAR3: "NORMAL_VALUE"
       - name: "example2"
         variables:
            - VAR1: "encrypt:/VARIABLE/ENCRYPTED"
            - VAR2: "ssm:/VARIABLE/DECRYPTED"
            - VAR3: "NORMAL_VALUE"
              
functions:
  example1:
    handler: bin/service
    name: ${self:provider.stage}-${self:service.name}-example1
    description: Example...
  example2:
    handler: bin/service
    name: ${self:provider.stage}-${self:service.name}-example2
    description: Example 2...         
```
