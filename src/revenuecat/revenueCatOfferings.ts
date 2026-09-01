import { PACKAGE_TYPE, type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';
import {
  REVENUECAT_LIFETIME_PRODUCT_ID,
  REVENUECAT_MONTHLY_PRODUCT_ID,
} from '@/config/revenueCat';

export type RevenueCatStorePackages = {
  monthly: PurchasesPackage | null;
  lifetime: PurchasesPackage | null;
};

function findPackageByTypeOrProductId(
  packages: PurchasesPackage[],
  packageType: PACKAGE_TYPE,
  productId: string,
): PurchasesPackage | null {
  return (
    packages.find(pkg => pkg.packageType === packageType) ??
    packages.find(pkg => pkg.product.identifier === productId) ??
    null
  );
}

export function resolveStorePackagesFromOffering(
  offering: PurchasesOffering | null | undefined,
): RevenueCatStorePackages {
  const packages = offering?.availablePackages ?? [];

  return {
    monthly: findPackageByTypeOrProductId(
      packages,
      PACKAGE_TYPE.MONTHLY,
      REVENUECAT_MONTHLY_PRODUCT_ID,
    ),
    lifetime: findPackageByTypeOrProductId(
      packages,
      PACKAGE_TYPE.LIFETIME,
      REVENUECAT_LIFETIME_PRODUCT_ID,
    ),
  };
}

export function hasAnyStorePackage(packages: RevenueCatStorePackages): boolean {
  return packages.monthly !== null || packages.lifetime !== null;
}
