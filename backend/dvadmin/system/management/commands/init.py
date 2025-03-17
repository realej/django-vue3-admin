import logging

from django.core.management.base import BaseCommand

from application import settings

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Project Initialization Command: python manage.py init
    """

    def add_arguments(self, parser):
        parser.add_argument(
            "init_name",
            nargs="*",
            type=str,
        )
        parser.add_argument("-y", nargs="*")
        parser.add_argument("-Y", nargs="*")
        parser.add_argument("-n", nargs="*")
        parser.add_argument("-N", nargs="*")
        parser.add_argument("-app", nargs="*")
        parser.add_argument("-A", nargs="*")

    def handle(self, *args, **options):
        reset = False
        if isinstance(options.get("y"), list) or isinstance(options.get("Y"), list):
            reset = True
        if isinstance(options.get("n"), list) or isinstance(options.get("N"), list):
            reset = False
        assign_apps = options.get("app") or options.get("A") or []
        for app in settings.INSTALLED_APPS:
            if assign_apps and app not in assign_apps:
                continue
            try:
                exec(
                    f"""
from {app}.fixtures.initialize import Initialize
Initialize(reset={reset},app="{app}").run()
                """
                )
            except ModuleNotFoundError:
                # Compatible with previous version initialization
                try:
                    exec(
                        f"""
from {app}.initialize import main
main(reset={reset})
                """
                    )
                except ModuleNotFoundError:
                    pass
        print("Initialization data is completed！")
