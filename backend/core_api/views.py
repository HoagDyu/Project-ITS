from rest_framework.decorators import api_view, permission_classes,parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.exceptions import *
from ai_engine.apps import ReadFile
import threading

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def receive_file(request):
    uploaded_file = request.FILES.get('file')
    
    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        thread = threading.Thread(target=ReadFile.process_file, args=(uploaded_file,))
        thread.daemon = True # Thread sẽ tự tắt nếu chương trình chính tắt
        thread.start()
        return Response({"status": "File received and processing started"}, status=status.HTTP_202_ACCEPTED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)