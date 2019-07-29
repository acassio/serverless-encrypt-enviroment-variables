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
      - ENV_VAR1: "SSM_PARAMETER_NAME_1"
      - ENV_VAR2: "SSM_PARAMETER_NAME_2"      
```

usage with function local variables:
```yaml
custom:
  env:
    keyArn: "arn:aws:kms......"
    functions:
       - name: "function1"
         variables:
            - VAR1: "encrypt:/VARIABLE/ENCRYPTED"
            - VAR2: "ssm:/VARIABLE/DECRYPTED"
            - VAR3: "NORMAL_VALUE"
       - name: "function2"
         variables:
            - VAR1: "encrypt:/VARIABLE/ENCRYPTED"
            - VAR2: "ssm:/VARIABLE/DECRYPTED"
            - VAR3: "NORMAL_VALUE"
```
