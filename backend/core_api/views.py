import uuid
import threading
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from ai_engine.mqtt_bridge import InMemoryFileWrapper, process_and_publish


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def receive_file(request):
    uploaded_file = request.FILES.get('file')

    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        file_bytes = uploaded_file.read()
        file_wrapper = InMemoryFileWrapper(uploaded_file.name, file_bytes)

        session_id = str(uuid.uuid4())

        thread = threading.Thread(
            target=process_and_publish,
            args=(file_wrapper, session_id),
        )
        thread.daemon = True
        thread.start()

        return Response(
            {"session_id": session_id, "status": "processing"},
            status=status.HTTP_202_ACCEPTED,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)