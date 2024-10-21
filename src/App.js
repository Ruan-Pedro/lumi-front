import React, { useEffect, useState } from 'react'
import { Table, Grid2, Select, MenuItem, Alert, Modal, Box, Snackbar, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Pagination, Container, Typography, Paper, debounce } from '@mui/material'
import axios from 'axios'

const months = [
  { value: 'JAN', label: 'Janeiro' },
  { value: 'FEV', label: 'Fevereiro' },
  { value: 'MAR', label: 'Março' },
  { value: 'ABR', label: 'Abril' },
  { value: 'MAI', label: 'Maio' },
  { value: 'JUN', label: 'Junho' },
  { value: 'JUL', label: 'Julho' },
  { value: 'AGO', label: 'Agosto' },
  { value: 'SET', label: 'Setembro' },
  { value: 'OUT', label: 'Outubro' },
  { value: 'NOV', label: 'Novembro' },
  { value: 'DEZ', label: 'Dezembro' }
]

const FaturaList = () => {
  const [faturas, setFaturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    anoReferencia: '',
    mesReferencia: '',
    page: 1,
    limit: 4
  })
  const [totalRecords, setTotalRecords] = useState(0)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [pathfile, setPathfile] = useState('')

  const fetchFaturas = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:3201/api/pdf`, {
        headers: {
          Authorization: 'authlumi',
        },
        params: filter
      })
      setFaturas(response.data.data)
      setTotalRecords(response.data.metadata.totalRecords)
      setSnackbarMessage('Faturas filtradas com sucesso!')
    } catch (error) {
      setSnackbarMessage('Erro ao filtrar faturas!')
    } finally {
      setLoading(false)
      setSnackbarOpen(true)
    }
  }

  useEffect(() => {
    fetchFaturas()
  }, [filter])

  const handleClienteChange = (e) => {
    setFilter({ ...filter, cliente: e.target.value })
  }

  const handleAnoChange = debounce((e) => {
    setFilter({ ...filter, anoReferencia: e.target.value })
  }, 1000)

  const handleMesChange = (e) => {
    setFilter({ ...filter, mesReferencia: e.target.value })
  }

  const handlePageChange = (event, value) => {
    setFilter({ ...filter, page: value })
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post('http://localhost:3201/api/pdf', formData, {
        headers: {
          Authorization: 'authlumi',
          'Content-Type': 'multipart/form-data'
        }
      })
      setSnackbarMessage('Fatura cadastrada com sucesso!')
      fetchFaturas()
      setModalOpen(false)
    } catch (error) {
      setSnackbarMessage('Erro ao cadastrar fatura!')
    } finally {
      setSnackbarOpen(true)
    }
  }

  const handleDownload = async (nomeArquivo) => {
    try {
      const pdfPath = `http://localhost:3201/uploads/${nomeArquivo}`
      window.open(pdfPath, '_blank')
    } catch (error) {
      console.error(error)
      setSnackbarMessage('Erro ao baixar o PDF!')
      setSnackbarOpen(true)
    }
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Lista de Faturas
      </Typography>
      <Grid2 container spacing={2} mb={3}>
        <Grid2 item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Número do Cliente"
            variant="outlined"
            value={filter.cliente}
            onChange={handleClienteChange}
          />
        </Grid2>
        <Grid2 item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Ano Referência"
            variant="outlined"
            onChange={handleAnoChange}
          />
        </Grid2>
        <Grid2 item xs={12} sm={6} md={4}>
          <Select
            fullWidth
            variant="outlined"
            value={filter.mesReferencia}
            onChange={handleMesChange}
            displayEmpty
          >
            <MenuItem value="">
              <em>Selecionar Mês</em>
            </MenuItem>
            {months.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </Grid2>
        <Grid2 item xs={12} sm={6} md={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setModalOpen(true)}
            fullWidth
          >
            Cadastrar Fatura
          </Button>
        </Grid2>
      </Grid2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome do Arquivo</strong></TableCell>
              <TableCell><strong>Ano Referência</strong></TableCell>
              <TableCell><strong>Mês Referência</strong></TableCell>
              <TableCell><strong>Total Valor</strong></TableCell>
              <TableCell><strong>Download</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Carregando...</TableCell>
              </TableRow>
            ) : (
              faturas.slice(0, 4).map((fatura) => (
                <TableRow key={fatura.id}>
                  <TableCell>{fatura.nomearquivo}</TableCell>
                  <TableCell>{fatura.anoreferencia}</TableCell>
                  <TableCell>{fatura.mesreferencia}</TableCell>
                  <TableCell>{fatura.totalvalor}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDownload(fatura.nomearquivo)}
                    >
                      Baixar PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(totalRecords / filter.limit)}
        page={filter.page}
        onChange={handlePageChange}
        color="primary"
        style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Modal para upload de PDF */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Cadastrar Fatura
          </Typography>
          <input type="file" onChange={handleFileChange} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            fullWidth
            style={{ marginTop: '20px' }}
          >
            Fazer Upload
          </Button>
        </Box>
      </Modal>
    </Container>
  )
}

export default FaturaList
