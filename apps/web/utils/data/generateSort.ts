import type { CrudSorting } from "@refinedev/core";

export const generateSort = (sorters?: CrudSorting) => {
	if (sorters && sorters.length > 0) {
		const sortBy: string[] = [];

		sorters.map((item) => {
			sortBy.push(item.field + ":" + item.order.toUpperCase());
		});

		return {
			sortBy,
		};
	}

	return;
};
