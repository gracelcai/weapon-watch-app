import boto3
import aws_encryption_sdk
from aws_encryption_sdk.identifiers import CommitmentPolicy
from aws_encryption_sdk.streaming_client import StreamEncryptor
from aws_cryptographic_material_providers.mpl import AwsCryptographicMaterialProviders
from aws_cryptographic_material_providers.mpl.config import MaterialProvidersConfig
from aws_cryptographic_material_providers.mpl.models import CreateAwsKmsKeyringInput
from aws_cryptographic_material_providers.mpl.references import IKeyring

import config

def encrypt_and_upload(file_path, s3_key):
    client = aws_encryption_sdk.EncryptionSDKClient(
        commitment_policy=CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
    )
    kms_client = boto3.client('kms', region_name="us-east-1")

    mat_prov = AwsCryptographicMaterialProviders(
    config=MaterialProvidersConfig())
    kms_keyring_input = CreateAwsKmsKeyringInput(
        kms_key_id="arn:aws:kms:us-east-1:203918845922:key/f0e18996-d4a0-49f6-827d-cc8915c5f864",
        kms_client=kms_client
    )
    kms_keyring: IKeyring = mat_prov.create_aws_kms_keyring(
        input=kms_keyring_input
    )
    s3_client = boto3.client("s3", region_name=config.AWS_REGION)

    ciphertext_buffer = bytearray()
    try:
        with open(file_path, "rb") as infile:
            plaintext = infile.read()

        ciphertext, encrypt_header = client.encrypt(
            source=plaintext,
            keyring=kms_keyring
        )


        s3_client.put_object(
            Bucket=config.S3_BUCKET,
            Key=s3_key,
            Body=bytes(ciphertext_buffer)
        )
        print(f"Encrypted file uploaded successfully to s3://{config.S3_BUCKET}/{s3_key}")

    except Exception as e:
        print(f"Error during encryption or upload: {e}")