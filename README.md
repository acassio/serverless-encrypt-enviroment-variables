# serverless-encrypt-enviroment-variables
Serverless plugin that get encrypted ssm parameters (kms) and keep them encrypted on lambda console with a valid hash.


_Example excluding the function prodFunctionHandler from deploying on beta stage_
```yaml
custom:
  encryptenv:
    keyArn: "arn:aws:kms......"
    variables:
      - ENV_VAR1: "SSM_PARAMETER_NAME_1"
      - ENV_VAR2: "SSM_PARAMETER_NAME_2"      
```