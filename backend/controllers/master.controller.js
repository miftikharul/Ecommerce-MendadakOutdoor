const { prisma } = require('../config/env');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat kategori.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await prisma.category.create({ data: { name } });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error create category:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Kategori dengan nama tersebut sudah ada!' });
    }
    res.status(500).json({ error: 'Gagal menambahkan kategori.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Kategori berhasil dihapus!' });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: 'Gagal menghapus kategori.' });
  }
};

const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat brand.' });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const newBrand = await prisma.brand.create({ data: { name } });
    res.status(201).json(newBrand);
  } catch (error) {
    console.error("Error create brand:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Brand dengan nama tersebut sudah ada!' });
    }
    res.status(500).json({ error: 'Gagal menambahkan brand.' });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({ where: { id } });
    res.json({ message: 'Brand berhasil dihapus!' });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({ error: 'Gagal menghapus brand.' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  getBrands,
  createBrand,
  deleteBrand
};