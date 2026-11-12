import unittest
from datetime import date
from import_genealogy import parse, publishable

AS_OF=date(2026,11,12)
def person(birth='',death='',restriction=''):
    lines=['0 @I1@ INDI','1 NAME Test /Person/']
    if birth: lines.extend(['1 BIRT','2 DATE '+birth])
    if death: lines.append('1 DEAT '+death)
    if restriction: lines.append('1 RESN '+restriction)
    return parse('\n'.join(lines))[0]

class PublicationTest(unittest.TestCase):
    def test_historical_birth(self):
        self.assertTrue(publishable(person('1820'),AS_OF))
        self.assertTrue(publishable(person('11 NOV 1936'),AS_OF))
        self.assertFalse(publishable(person('12 NOV 1936'),AS_OF))
        self.assertFalse(publishable(person('1936'),AS_OF))
        self.assertTrue(publishable(person('1935'),AS_OF))
        self.assertTrue(publishable(person('OCT 1936'),AS_OF))
        self.assertFalse(publishable(person('NOV 1936'),AS_OF))
    def test_legacy_spanish_and_duplicate_birth(self):
        for birth in ('13 AGOSTO 1842','01 MARZO 1840','SEPTIEMBRE 1932'):
            self.assertTrue(publishable(person(birth),AS_OF))
        self.assertFalse(publishable(person('NOVIEMBRE 1936'),AS_OF))
        n=person('30 MAR 1927')
        n['children'].insert(1, {'id':None,'tag':'BIRT','value':'','children':[]})
        self.assertTrue(publishable(n,AS_OF))
        n['children'].extend(person('1950')['children'][1:])
        self.assertFalse(publishable(n,AS_OF))
    def test_privacy_and_alive(self):
        self.assertFalse(publishable(person('1820',restriction='privacy'),AS_OF))
        self.assertFalse(publishable(person('1820',death='N'),AS_OF))
        self.assertFalse(publishable(person('1820',death='Y',restriction='confidential'),AS_OF))
    def test_existing_deceased(self):
        self.assertTrue(publishable(person('1980',death='Y'),AS_OF))
        self.assertTrue(publishable(person(death='Y'),AS_OF))
    def test_uncertain(self):
        for birth in ('','ABT 1820','BET 1820 AND 1825','31 FEB 1820','@#DJULIAN@ 1820'):
            self.assertFalse(publishable(person(birth),AS_OF))

if __name__=='__main__':
    unittest.main()
