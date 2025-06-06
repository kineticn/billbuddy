import { describe, it, expect } from 'vitest';
import { BillFragment, PaymentFragment } from '../src/graphql/fragmentMap';

describe('fragmentMap', () => {
  it('should export BillFragment', () => {
    expect(BillFragment).toMatch(/fragment BillFields on Bill/);
    expect(BillFragment).toMatch(/amount/);
  });
  it('should export PaymentFragment', () => {
    expect(PaymentFragment).toMatch(/fragment PaymentFields on Payment/);
    expect(PaymentFragment).toMatch(/billId/);
  });
});
