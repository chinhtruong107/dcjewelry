export type ProvinceOption = {
  code: string;
  name: string;
  full_name: string;
  code_name?: string | null;
};

export type WardOption = {
  code: string;
  name: string;
  full_name: string;
  province_code: string;
  code_name?: string | null;
};

export type AddressFields = {
  address: string;
  province_code: string;
  ward_code: string;
};

export function buildFullAddress(
  detail: string,
  ward?: WardOption | null,
  province?: ProvinceOption | null
) {
  return [detail.trim(), ward?.full_name, province?.full_name]
    .filter(Boolean)
    .join(", ");
}

export function findProvince(provinces: ProvinceOption[], code?: string | null) {
  return provinces.find((province) => province.code === code) ?? null;
}

export function findWard(wards: WardOption[], code?: string | null) {
  return wards.find((ward) => ward.code === code) ?? null;
}

export async function fetchProvinces() {
  const response = await fetch("/api/locations/provinces", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách tỉnh/thành.");
  }

  return (await response.json()) as ProvinceOption[];
}

export async function fetchWards(provinceCode: string) {
  const response = await fetch(`/api/locations/provinces/${provinceCode}/wards`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách phường/xã.");
  }

  return (await response.json()) as WardOption[];
}
