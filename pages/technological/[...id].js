/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/Layout';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Регистрация шрифта
Font.register({
    family: 'Roboto',
    src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf',
});

const TechnologicalItemPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await axios.get(`/api/technological?id=${id}`);
            setItem(response.data);
        } catch (error) {
            console.error('Помилка при отриманні даних:', error);
        } finally {
            setLoading(false);
        }
    };

    const PDFDocument = ({ item }) => (
        <Document>
            <Page style={styles.body}>
                <Text style={styles.header}>{item.name.toUpperCase()}</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.cell, styles.headerCell]}>Назва комплектуючої</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Кількість</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Примітка</Text>
                    </View>
                    {item.components.map((comp, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.cell}>{comp.item?.name || comp.name}</Text>
                            <Text style={styles.quantityCell}>{comp.quantity}</Text>
                            <Text style={styles.cell} />
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );

    const styles = StyleSheet.create({
        body: {
            padding: 20,
            fontFamily: 'Roboto',
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        table: {
            display: 'table',
            width: '100%',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#000',
        },
        tableHeader: {
            flexDirection: 'row',
            backgroundColor: '#f2f2f2',
            borderBottomWidth: 1,
            borderColor: '#000',
        },
        row: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: '#ddd',
        },
        cell: {
            flex: 1,
            fontSize: 12,
            padding: 5,
            textAlign: 'left',
        },
        quantityCell: {
            flex: 1,
            fontSize: 12,
            padding: 5,
            textAlign: 'center',
        },
        headerCell: {
            fontWeight: 'bold',
            textAlign: 'center',
        },
    });

    if (loading) {
        return (
            <Layout>
                <p>Завантаження...</p>
            </Layout>
        );
    }

    if (!item) {
        return (
            <Layout>
                <p>Дані не знайдено.</p>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">

                <h1 className="text-3xl font-bold text-center mb-6">{item.name.toUpperCase()}</h1>


                <div className="border border-gray-300 mb-6">
                    <div className="grid grid-cols-3 bg-gray-200 border-b border-gray-300 font-bold text-center">
                        <div className="p-2">Назва комплектуючої</div>
                        <div className="p-2">Кількість</div>
                        <div className="p-2">Примітка</div>
                    </div>
                    {item.components.map((comp, index) => (
                        <div key={index} className="grid grid-cols-3 border-b border-gray-300 text-center">
                            <div className="p-2">{comp.item?.name || comp.name}</div>
                            <div className="p-2">{comp.quantity}</div>
                            <div className="p-2"></div>
                        </div>
                    ))}
                </div>

                {/* Кнопка для скачивания PDF */}
                <PDFDownloadLink
                    document={<PDFDocument item={item} />}
                    fileName={`${item.name}.pdf`}
                    className="mt-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    {({ loading }) => (loading ? 'Завантаження PDF...' : 'Завантажити PDF')}
                </PDFDownloadLink>
            </div>
        </Layout>
    );
};

export default TechnologicalItemPage;
