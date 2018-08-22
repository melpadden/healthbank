using System;
using System.Collections.Generic;
using System.Text;

namespace AZF.QRStore.Models
{
    public class Medication
    {
    }

    public class TT
    {
        public List<int> Q { get; set; }
        public string T { get; set; }
        public List<double?> D { get; set; }
    }

    public class Pos
    {
        public string DtFrom { get; set; }
        public List<int> D { get; set; }
        public List<TT> TT { get; set; }
        public string DtTo { get; set; }
    }

    public class Medicament
    {
        public string AppInstr { get; set; }
        public int AutoMed { get; set; }
        public string Id { get; set; }
        public int IdType { get; set; }
        public int KOMed { get; set; }
        public List<Pos> Pos { get; set; }
        public string PrscbBy { get; set; }
        public string Roa { get; set; }
        public string TkgRsn { get; set; }
        public string Unit { get; set; }
    }

    public class Patient
    {
        public List<object> Alg { get; set; }
        public string BDt { get; set; }
        public string City { get; set; }
        public string FName { get; set; }
        public int Gender { get; set; }
        public int Hght { get; set; }
        public string LName { get; set; }
        public int LivInsLvl { get; set; }
        public string Lng { get; set; }
        public int Repr { get; set; }
        public int RnInsLvl { get; set; }
        public string Street { get; set; }
        public int Wght { get; set; }
        public string Zip { get; set; }
    }

    public class PrescriptionRootObject
    {
        public string Auth { get; set; }
        public DateTime Dt { get; set; }
        public string Id { get; set; }
        public int MedType { get; set; }
        public List<Medicament> Medicaments { get; set; }
        public Patient Patient { get; set; }
        public string Rmk { get; set; }
        public string ValBy { get; set; }
        public DateTime ValDt { get; set; }
    }
}
