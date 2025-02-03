from dotenv import load_dotenv
import os

load_dotenv()

S3_BUCKET = os.getenv('S3_BUCKET')
KMS_KEY_ARN = os.getenv('KMS_KEY_ARN')
AWS_REGION = os.getenv('AWS_REGION')
