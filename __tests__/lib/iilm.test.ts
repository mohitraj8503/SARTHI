import { isIilmUniversity } from '@/lib/utils/iilm';

describe('isIilmUniversity', () => {
  it('should return true for standard IILM variations', () => {
    expect(isIilmUniversity('IILM')).toBe(true);
    expect(isIilmUniversity('iilm')).toBe(true);
    expect(isIilmUniversity('IILM University')).toBe(true);
    expect(isIilmUniversity('IILM University Noida')).toBe(true);
    expect(isIilmUniversity('IILM Greater Noida')).toBe(true);
    expect(isIilmUniversity('IILM Gurgaon')).toBe(true);
  });

  it('should return true for punctuated or misspelled IILM names', () => {
    expect(isIilmUniversity('I.I.L.M.')).toBe(true);
    expect(isIilmUniversity('I.I.L.M. University')).toBe(true);
    expect(isIilmUniversity('iilm unievristy')).toBe(true);
    expect(isIilmUniversity('iilm univecity')).toBe(true);
    expect(isIilmUniversity('ilm university')).toBe(true);
  });

  it('should return false for non-IILM universities', () => {
    expect(isIilmUniversity('Arka Jain University')).toBe(false);
    expect(isIilmUniversity('Delhi University')).toBe(false);
    expect(isIilmUniversity('Amity University')).toBe(false);
    expect(isIilmUniversity('IIT Delhi')).toBe(false);
    expect(isIilmUniversity(null)).toBe(false);
    expect(isIilmUniversity(undefined)).toBe(false);
    expect(isIilmUniversity('')).toBe(false);
    expect(isIilmUniversity('   ')).toBe(false);
    expect(isIilmUniversity({ name: 'IILM' } as any)).toBe(false);
    expect(isIilmUniversity(12345 as any)).toBe(false);
    expect(isIilmUniversity([] as any)).toBe(false);
  });
});
