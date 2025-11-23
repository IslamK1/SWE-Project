from app.base.dao import BaseDAO
from app.links.models import Link


class LinkDAO(BaseDAO):
    model = Link
