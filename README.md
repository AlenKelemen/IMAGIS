# IMAGIS

* db: JSON at GitHub
* server: GitHub
* client: ol6
  
## Description

* Opći tehnički uvjeti (login)
  * dostup na osnovu privilegija korisnika
  * prava korištenja grupa podataka
  * centralni export podataka iz GIS-a
  * podloge uključuju SRPJ
* Pregledavanje i korištenje GIS-a (header 1:IMAGIS)
  * [x] Legenda: prozirnost, izbor simbola, izbor podloga (taskpane section 1)
  * [ ] Postavke: dodavanje slojeva iz drugih portala, uređenje sheme podataka (taskpane section 2)
  * [ ] Pozicioniranje: pozicioniranje na objekt i geokoding (taskpane section 3)
  * [x] Svojstva: atributi, dužina, površina, visine, točke, export odabranog (taskpane section 4)
  * [ ] Odabir: sql upit za selekciju i selekcija sa linijom, poligonom i poligionskim objektom na karti (taskpane section 5)
  * [ ] Statistika na odabranog (taskpane section 6)
  * [ ] Tisak u pdf (taskpane section 7)
  * [ ] Uzdužni profil odabranog voda (taskpane section 8)
    * izbor mjerila
    * veza na odabrano
    * dužina. materijal, pad
    * eksport profila DXF
    * umetanje čvorova u profil
  * [x] selekcija sa točkom i kvadratnim zahvatom na karti (toolbar 1)
  * [ ] Mjerenje: udaljenosti i površine (toolbar 2)
  * [ ] Crtanje i pisanje (toolbar 3)

* Pregledavanje i korištenje GIS-a - web (podskup predhodnog)
  * pozicioniranje po adresi i objektima
  * prilagođeni GUI
  * offline prikpljanje podataka

* GIS vodoopskrbe (header 2: Vodoopskrba)
    * [ ] Standard ASCII/DXF download standarda, visinski: niveleta, teren, dubine okna (taskpane section 1)
    * [ ] Automatski upis atributa i objekata za standardizirani ASCII/DXF (taskpane section 2)
    * [ ] Montažne sheme i dokumenti se mogu pregledati i pridružiti (taskpane section 3)
    * [ ] Kontrola topo i atributa (taskpane section 4)
    * [ ] EPANET provjera i export u EPANET (taskpane section 5)
    * [ ] automatski upis atributa i objekata za standardizirani ASCII/DXF (taskpane section 6)Vođenje podataka o kvarovima (taskpane section 6-10)
      * vezano uz adresu (ako postoji adresni model)
      * prijave putem weba (hiperlink)
      * atributi: vidljivo obilježje, uzrok, lokacija, tip kvara
      * povezano s radnim nalogom
      * export u KANEW
      * izvješća
      * zatvaranje zasuna
      * tijek popravka
    * [ ] NUS i mjerna oprema, povezivanje (upis mjerača u GIS i linka odnosno file-a iz loggera)(taskpane section 6)
    * [ ] Mjerenja, prikaz i interpolacija vrijednosti koje fale (taskpane section 7)
      * CRUD mjerenja u GIS db 
  * Nadzor gubitaka vode (header 3: Gubici, login)
    * [ ] DMA - definiranje i automatsko pridruživanje mjerača i privremenih mjerača u DMA (taskpane section 1)
    * [x] ILI - izračun po IWA metodologiji, izračun pri akcidentu i na osnovu min nočnih protoka za DMA i sustav za mjesec, kvartal i godinu  (taskpane section 2)
    * [ ] Gubici - tablični prikaz gubitaka  (taskpane section 3)
    * [x] Grafikon mjerenja   (taskpane section 7)
    * [ ] Prividni gubici, povezano s bazom očitanja vode, analiza prividnih gubitaka (krađe vode) po zoni/ mjesečno  (taskpane section 8)
* GIS odvodnje (header 4: Sustav)
  * Evidencija i ažuriranje podataka (taskpane section 1)
    * definirani standard ASCII/DXF
    * visinski: niveleta, teren, dubine okna
    * liste atributa se mogu mijenjati
    * montažne sheme se mogu pridružiti
    * kontrola topo i atributa
    * automatski upis atributa i objekata za standardizirani ASCII/DXF
  * Vođenje podataka o kvarovima i problemima (taskpane section 2)
    * vezano uz adresu (ako postoji adresni model)
    * prijave putem weba (hiperlink)
    * atributi: vidljivo obilježje, uzrok, lokacija, tip kvara
    * povezano/izrada s radnim nalogom
    * export u KANEW
    * izvješća
    * zatvaranje zasuna
    * tijek popravka
  * Evidencija problema strukturalne stabilnosti sustava odvodnje (optička inspekcija) (taskpane section 3)
    * plan inspekcije CCTV
    * izviješće
    * podaci direktno iz kamere
    * stanje cijevi u GIS-u prema HRN EN 13508-2:2003+A1:2011
    * opis stanja cijevi je posebna linijska tema sa stacionažom početka i kraja
    * prikaz slika i videa kao atribut stanja cijevi
    * video povezan s pomicanjem točke u GIS-u
  * Evidencija problema vodonepropusnosti (taskpane section 4)
    * plan ispitivanja vodonepropusnosti sa radnim nalozima
  * Evidencija septičkih jama (taskpane section 5)
  * vezano uz adresu (ako postoji adresni model)
* Povezivanje s PIS
  * edit adresnog modela, preuzimanje službenog
  * status priključka (poljoprivredni, fontana)
  * standard tablica koje se prezimanju iz PIS za povezivanje s prostorom
* Izdavanje suglasnosti (header 5: Suglasnosti, login)
  * izrada pdf suglasnosti sa kartom
  * pregled u GIS izdanih suglasnosti
* Praćenje vozila (header: Vozila, login)
  * potreban hiperlink na server proizvođaća uređaja
