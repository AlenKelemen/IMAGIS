# IMAGIS

* db: JSON at GitHub
* server: GitHub
* client: ol6
  
## Description

* Opći tehnički uvjeti (login)
  * dostup na osnovu privilegija korisnika
  * prava korištenja grupa podataka
  * centralni export podataka iz GIS-a
* Pregledavanje i korištenje GIS-a (mainmenu:home)
  * legenda: prozirnost, izbor simbola, sql, izbor podloga,dodavanje slojeva iz drugih portala (upis linka)
  * pozicioniranje na objekt i geokoding
  * info: atributi, dužina, površina, visine, točke
  * mjerenje udaljenosti i površine
  * sql upit za selekciju
  * selekcija sa točkom, linijom, poligonom i objektom na karti (u posebnom menu-u)
  * statistika na odabrano
  * pisanje i crtanje
  * tisak u pdf
  * export odabranog
  * uzdužni profil odabranog voda
    * izbor mjerila
    * veza na odabrano
    * dužina. materijal, pad
    * eksport profila DXF
    * umetanje čvorova u profil
* Pregledavanje i korištenje GIS-a - web (već je u predhodnom)
  * pozicioniranje po adresi i objektima
  * prilagođeni GUI
* GIS vodoopskrbe (mainmenu: Sustav, login)
  * Evidencija i ažuriranje podataka (mainmenu: Uredi, login)
    * definirani standard ASCII/DXF
    * visinski: niveleta, teren, dubine okna
    * liste atributa se mogu mijenjati
    * montažne sheme se mogu pridružiti
    * kontrola topo i atributa
    * provjera za EPANET
    * automatski upis atributa i objekata za standardizirani ASCII/DXF
  * Vođenje podataka o kvarovima (mainmenu: Kvarovi, login)
    * vezano uz adresu (ako postoji adresni model)
    * prijave putem weba (hiperlink)
    * atributi: vidljivo obilježje, uzrok, lokacija, tip kvara
    * povezano s radnim nalogom
    * export u KANEW
    * izvješća
    * zatvaranje zasuna
    * tijek popravka
  * Povezivanje s NUS i mjernom opremom (mainmenu: Mjerenje, login)
    * sučelje za dodavanje izmjerenog u GIS i položajno
    * interpolacija vrijednosti koje fale
    * pohrana mjerenja
  * Nadzor gubitaka vode (mainmenu: Gubici, login)
    * definiranje DMA
    * pridruživanje mjerača i privremenih mjerača
    * izračun gubitka vode pri akcidentu
    * izračun ili upis min. noćnog protoka
    * graf mjerenja
    * povezano s bazom očitanja vode, analiza prividnih gubitaka (krađe vode) po zoni/ mjesečno
  * Povezivanje i eksport u EPANET
* GIS odvodnje (mainmenu: Sustav, login)- separate page
  * Evidencija i ažuriranje podataka (mainmenu: Uredi, login)
    * definirani standard ASCII/DXF
    * visinski: niveleta, teren, dubine okna
    * liste atributa se mogu mijenjati
    * montažne sheme se mogu pridružiti
    * kontrola topo i atributa
    * automatski upis atributa i objekata za standardizirani ASCII/DXF
  * Vođenje podataka o kvarovima i problemima (mainmenu: Kvarovi, login)
    * vezano uz adresu (ako postoji adresni model)
    * prijave putem weba (hiperlink)
    * atributi: vidljivo obilježje, uzrok, lokacija, tip kvara
    * povezano/izrada s radnim nalogom
    * export u KANEW
    * izvješća
    * zatvaranje zasuna
    * tijek popravka
  * Evidencija problema strukturalne stabilnosti sustava odvodnje (optička inspekcija) (mainmenu: CCTV, login)
    * plan inspekcije CCTV
    * izviješće
    * podaci direktno iz kamere
    * stanje cijevi u GIS-u prema HRN EN 13508-2:2003+A1:2011
    * opis stanja cijevi je posebna linijska tema sa stacionažom početka i kraja
    * prikaz slika i videa kao atribut stanja cijevi
    * video povezan s pomicanjem točke u GIS-u
  * Evidencija problema vodonepropusnosti
    * plan ispitivanja vodonepropusnosti sa radnim nalozima
  * Evidencija septičkih jama
  * vezano uz adresu (ako postoji adresni model)
* Povezivanje s PIS
  * edit adresnog modela, preuzimanje službenog
  * status priključka (poljoprivredni, fontana)
  * standard tablica koje se prezimanju iz PIS za povezivanje s prostorom
* Izdavanje suglasnosti (mainmenu: Suglasnosti, login)
  * izrada pdf suglasnosti sa kartom
  * pregled u GIS izdanih suglasnosti
* Praćenje vozila (mainmenu: Vozila, login)
  * potreban hiperlink na server proizvođaća uređaja
