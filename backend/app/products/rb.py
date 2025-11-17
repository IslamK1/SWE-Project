class RBProduct:
    def __init__(self, id: int | None = None, name: str | None = None, supplier_id: int | None = None):
        self.id = id
        self.name = name
        self.supplier_id = supplier_id

    def to_dict(self) -> dict:
        data = {
			'id': self.id,
			'name': self.name,
			'supplier_id': self.supplier_id
		}
        filtered_data = {key: value for key, value in data.items() if value is not None}
        return filtered_data
