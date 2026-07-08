from rest_framework import serializers


class FileSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=True, source='file_url', write_only=True)
    file_url = serializers.FileField(read_only=True)

    def validate_file(self, value):
        if not value.name.lower().endswith('.mov','.mp4','.png','.jpg','.jpeg'):
            raise serializers.ValidationError("sai form")
        return value