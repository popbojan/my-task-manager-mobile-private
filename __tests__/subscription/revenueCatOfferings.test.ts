jest.mock('react-native-purchases', () => ({
  PACKAGE_TYPE: {
    MONTHLY: 'MONTHLY',
    LIFETIME: 'LIFETIME',
  },
}));

import { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';
import { resolveStorePackagesFromOffering } from '@/revenuecat/revenueCatOfferings';

function createPackage(
  identifier: string,
  packageType: PACKAGE_TYPE,
  priceString: string,
): PurchasesPackage {
  return {
    identifier,
    packageType,
    product: {
      identifier,
      priceString,
    },
  } as PurchasesPackage;
}

describe('revenueCatOfferings', () => {
  it('uses store prices from RevenueCat packages', () => {
    const offering = {
      identifier: 'default',
      availablePackages: [
        createPackage('monthly', PACKAGE_TYPE.MONTHLY, '€9.99'),
        createPackage('lifetime', PACKAGE_TYPE.LIFETIME, '€79.99'),
      ],
    };

    const packages = resolveStorePackagesFromOffering(offering as never);

    expect(packages.monthly?.product.priceString).toBe('€9.99');
    expect(packages.lifetime?.product.priceString).toBe('€79.99');
  });

  it('matches Google Play base plan product identifiers', () => {
    const offering = {
      identifier: 'default',
      availablePackages: [
        createPackage('monthly:monthly-base', PACKAGE_TYPE.MONTHLY, '€9.99'),
        createPackage('lifetime', PACKAGE_TYPE.LIFETIME, '€79.99'),
      ],
    };

    const packages = resolveStorePackagesFromOffering(offering as never);

    expect(packages.monthly?.product.priceString).toBe('€9.99');
    expect(packages.lifetime?.product.priceString).toBe('€79.99');
  });

  it('handles missing offering packages', () => {
    const packages = resolveStorePackagesFromOffering({
      identifier: 'default',
      availablePackages: [],
    } as never);

    expect(packages.monthly).toBeNull();
    expect(packages.lifetime).toBeNull();
  });
});
