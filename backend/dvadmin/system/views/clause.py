from rest_framework.views import APIView
from django.shortcuts import render


class PrivacyView(APIView):
    """
    Backend Privacy Policy
    """
    permission_classes = []

    def get(self, request, *args, **kwargs):
        return render(request, 'privacy.html')



class TermsServiceView(APIView):
    """
    Backend Service Terms
    """
    permission_classes = []

    def get(self, request, *args, **kwargs):
        return render(request, 'terms_service.html')
