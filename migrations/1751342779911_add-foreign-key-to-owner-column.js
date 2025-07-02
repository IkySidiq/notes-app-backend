/* //* NOTES
//* jadi jika saat membuat table berisi kolom kita bisa langsung menyematkan constraint constraintnya, sedangkan jika kita buat constraintnya belakangan kita harus menggunakan add constraint. Sebenernya kita juga bisa membuat kolom belakangan dengan add colomn, cuman ada constraint tertentu yang tidak bisa dibuat barengan dengan kolom makanya kolom yang belakangan dibuat ini harus menggunakan add column.
*/

exports.shorthands = undefined;
 
exports.up = (pgm) => {
  // TODO: Ini perlu ditambahkan karena sebelum menambahkan constraint foreign key dari notes ke user tidak boleh ada data yang orphan. 
  // TODO: Ini menambahkan data dummy di table user untuk dijadikan parents pada data di table notes yang orphan
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old notes')");
 
  // TODO: Lalu yang orphan di set ownernya yang asalnya NULL jadi old_notes dari penambahan dummy table user di atas
  pgm.sql("UPDATE notes SET owner = 'old_notes' WHERE owner IS NULL");
 
  //* REFERENCES userd(id) artinya isi dari owner ini harus sama persis dengan users(id) yang ada di table notes. 
  //* users adalah nama tablenya dan (id)-nya adalah nama kolom di dalam table users. Arti dari DELETE CASCADE adalah pada saat data di tabel induk (referensi) dihapus, maka data anak yang terkait akan ikut terhapus otomatis. Tidak berlaku sebaliknya, jika tabel anak dihapus akan tetap terhapus tapi induknya (users) tidak akan terhapus
  //* fk_<tabel_asal>.<kolom_asal>_<tabel_tujuan>.<kolom_tujuan> foreign key berasal dari table notes kolom owner dengan tujuan relasi ke table users kolom ID
  pgm.addConstraint('notes', 'fk_notes.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE'); 
  /* //* Contoh pembuatan constraint langung saat pembuatan table
  pgm.createTable('notes', {
  owner: {
    type: 'VARCHAR(50)',
    notNull: true,
    references: 'users(id)',
    onDelete: 'CASCADE',
  },
  });
  */
};
 
exports.down = (pgm) => {
  // menghapus constraint fk_notes.owner_users.id pada tabel notes
  pgm.dropConstraint('notes', 'fk_notes.owner_users.id');
 
  // mengubah nilai owner old_notes pada note menjadi NULL
  pgm.sql("UPDATE notes SET owner = NULL WHERE owner = 'old_notes'");
 
  // menghapus user baru.
  pgm.sql("DELETE FROM users WHERE id = 'old_notes'");
};