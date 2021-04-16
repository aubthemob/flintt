import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'

export default function StartOfDay ({ day }) {
    if (day) {
        return (
            <View>
                <Text>
                    {
                        day === 'today' &&
                            `Today` ||
                        day === 'yesterday' &&
                            `Yesterday evening`
                    }
                </Text>
            </View>
        )
    } else {
        return null
    }
}