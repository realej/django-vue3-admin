from django.dispatch import Signal
# Initialize the signal
pre_init_complete = Signal()
detail_init_complete = Signal()
post_init_complete = Signal()
# Tenant initialization signal
pre_tenants_init_complete = Signal()
detail_tenants_init_complete = Signal()
post_tenants_init_complete = Signal()
post_tenants_all_init_complete = Signal()
# Tenant creation completion signal
tenants_create_complete = Signal()
