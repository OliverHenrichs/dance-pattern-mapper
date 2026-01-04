import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {WCSPattern} from "@/components/types/WCSPattern";
import {defaultNewPattern, defaultPatterns} from "@/components/DefaultPatterns";
import {WCSPatternLevel, WCSPatternType} from "@/components/types/WCSPatternEnums";

const WCSPatternGraph = () => {
    const [patterns, setPatterns] = useState<WCSPattern[]>(defaultPatterns);
    const [selectedPattern, setSelectedPattern] = useState<WCSPattern | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newPattern, setNewPattern] = useState(defaultNewPattern);
    const [tagInput, setTagInput] = useState('');

    const patternTypes = Object.values(WCSPatternType);
    const levels = Object.values(WCSPatternLevel);

    const addPattern = () => {
        if (!newPattern.name.trim()) return;

        const pattern = {
            ...newPattern,
            id: patterns.length + 1,
        };

        setPatterns([...patterns, pattern]);
        setNewPattern(defaultNewPattern);
        setTagInput('');
        setIsAddingNew(false);
    };

    const deletePattern = (id?: number) => {
        setPatterns(patterns.filter(p => p.id !== id));
        if (selectedPattern?.id === id) setSelectedPattern(null);
    };

    const addTag = () => {
        if (tagInput.trim() && !newPattern.tags.includes(tagInput.trim())) {
            setNewPattern({
                ...newPattern,
                tags: [...newPattern.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const getDependents = (id: number) => {
        return patterns.filter(p => p.prerequisites.includes(id));
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {/* Using a dancing figure emoji as a placeholder for a vector icon */}
                        <Text style={styles.headerIcon}>💃</Text>
                        <Text style={[styles.headerTitle, { fontSize: 18 }]}>Dance Pattern Mapper</Text>
                    </View>
                </View>
                <View style={styles.headerActionsRow}>
                    <TouchableOpacity
                        onPress={() => setIsAddingNew(!isAddingNew)}
                        style={styles.buttonGreen}
                    >
                        <Text style={styles.buttonText}>Add Pattern</Text>
                    </TouchableOpacity>
                </View>

                {isAddingNew && (
                    <View style={styles.addPatternContainer}>
                        <Text style={styles.sectionTitle}>Add New Pattern</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                placeholder="Pattern Name"
                                value={newPattern.name}
                                onChangeText={(text) => setNewPattern({ ...newPattern, name: text })}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Counts"
                                value={newPattern.counts.toString()}
                                onChangeText={(text) => setNewPattern({ ...newPattern, counts: parseInt(text) || 0 })}
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        </View>
                        <View style={styles.inputRow}>
                            <View style={styles.input}>
                                <Text style={styles.label}>Type</Text>
                                {patternTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.prereqItem,
                                            newPattern.type === type && styles.prereqItemSelected
                                        ]}
                                        onPress={() => setNewPattern({ ...newPattern, type: type as WCSPatternType })}
                                    >
                                        <Text>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.input}>
                                <Text style={styles.label}>Level</Text>
                                {levels.map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        style={[
                                            styles.prereqItem,
                                            newPattern.level === level && styles.prereqItemSelected
                                        ]}
                                        onPress={() => setNewPattern({ ...newPattern, level: level as WCSPatternLevel })}
                                    >
                                        <Text>{level}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <TextInput
                            placeholder="Description"
                            value={newPattern.description}
                            onChangeText={(text) => setNewPattern({ ...newPattern, description: text })}
                            style={styles.textarea}
                            multiline
                        />
                        <View style={styles.prereqContainer}>
                            <Text style={styles.label}>Prerequisites</Text>
                            <ScrollView horizontal>
                                {patterns.map(p => (
                                    <TouchableOpacity
                                        key={p.id}
                                        style={[
                                            styles.prereqItem,
                                            newPattern.prerequisites.includes(p.id) && styles.prereqItemSelected
                                        ]}
                                        onPress={() => {
                                            if (newPattern.prerequisites.includes(p.id)) {
                                                setNewPattern({ ...newPattern, prerequisites: newPattern.prerequisites.filter(id => id !== p.id) });
                                            } else {
                                                setNewPattern({ ...newPattern, prerequisites: [...newPattern.prerequisites, p.id] });
                                            }
                                        }}
                                    >
                                        <Text>{p.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <View style={styles.tagsContainer}>
                            <Text style={styles.label}>Tags</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Add tag"
                                    value={tagInput}
                                    onChangeText={setTagInput}
                                    onSubmitEditing={addTag}
                                    style={styles.input}
                                />
                                <TouchableOpacity onPress={addTag} style={styles.buttonIndigoSmall}>
                                    <Text style={styles.buttonText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.tagsRow}>
                                {newPattern.tags.map((tag, idx) => (
                                    <View key={idx} style={styles.tagItem}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                        <TouchableOpacity onPress={() => setNewPattern({ ...newPattern, tags: newPattern.tags.filter((_, i) => i !== idx) })}>
                                            <Text style={styles.tagRemove}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity onPress={addPattern} style={styles.buttonIndigo}>
                                <Text style={styles.buttonText}>Save Pattern</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsAddingNew(false)} style={styles.buttonGray}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.patternsRow}>
                    <View style={styles.patternListContainer}>
                        <Text style={styles.sectionTitle}>Pattern List</Text>
                        <ScrollView style={styles.patternListScroll}>
                            {patterns.map(pattern => (
                                <TouchableOpacity
                                    key={pattern.id}
                                    onPress={() => setSelectedPattern(pattern)}
                                    style={[
                                        styles.patternItem,
                                        selectedPattern?.id === pattern.id
                                            ? styles.patternItemSelected
                                            : styles.patternItemUnselected
                                    ]}
                                >
                                    <View style={styles.patternItemHeader}>
                                        <View style={{flex: 1}}>
                                            <Text style={styles.patternName}>{pattern.name}</Text>
                                            <View style={styles.patternTagsRow}>
                                                <Text style={styles.patternTag}>{pattern.counts} count</Text>
                                                <Text style={styles.patternTag}>{pattern.type}</Text>
                                                <Text style={styles.patternTag}>{pattern.level}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation?.();
                                                deletePattern(pattern.id);
                                            }}
                                        >
                                            <Text style={styles.deleteIcon}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.patternDetailsContainer}>
                        {selectedPattern ? (
                            <View style={styles.patternDetails}>
                                <Text style={styles.sectionTitle}>Pattern Details</Text>
                                <Text style={styles.patternDetailsName}>{selectedPattern.name}</Text>
                                <Text style={styles.patternDetailsDesc}>{selectedPattern.description}</Text>
                                <View style={styles.patternDetailsRow}>
                                    <View style={styles.patternDetailsCol}>
                                        <Text style={styles.label}>Counts:</Text>
                                        <Text style={styles.patternDetailsValue}>{selectedPattern.counts}</Text>
                                    </View>
                                    <View style={styles.patternDetailsCol}>
                                        <Text style={styles.label}>Type:</Text>
                                        <Text style={styles.patternDetailsValue}>{selectedPattern.type}</Text>
                                    </View>
                                    <View style={styles.patternDetailsCol}>
                                        <Text style={styles.label}>Level:</Text>
                                        <Text style={styles.patternDetailsValue}>{selectedPattern.level}</Text>
                                    </View>
                                </View>
                                {selectedPattern.tags.length > 0 && (
                                    <View style={styles.tagsRow}>
                                        <Text style={styles.label}>Tags:</Text>
                                        <View style={styles.tagsRow}>
                                            {selectedPattern.tags.map((tag, idx) => (
                                                <Text key={idx} style={styles.tagText}>{tag}</Text>
                                            ))}
                                        </View>
                                    </View>
                                )}
                                <View style={styles.prereqContainer}>
                                    <Text style={styles.label}>Prerequisites:</Text>
                                    {selectedPattern.prerequisites.length === 0 ? (
                                        <Text style={styles.patternDetailsDesc}>None (foundational pattern)</Text>
                                    ) : (
                                        <View>
                                            {selectedPattern.prerequisites.map(preqId => {
                                                const preq = patterns.find(p => p.id === preqId);
                                                return preq ? (
                                                    <Text key={preqId} style={styles.prereqItem}>{preq.name}</Text>
                                                ) : null;
                                            })}
                                        </View>
                                    )}
                                </View>
                                <View style={styles.prereqContainer}>
                                    <Text style={styles.label}>Builds into:</Text>
                                    {getDependents(selectedPattern.id).length === 0 ? (
                                        <Text style={styles.patternDetailsDesc}>No dependent patterns yet</Text>
                                    ) : (
                                        <View>
                                            {getDependents(selectedPattern.id).map(dep => (
                                                <Text key={dep.id} style={styles.prereqItem}>{dep.name}</Text>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.patternDetailsEmpty}>
                                <Text style={styles.emptyIcon}>🌐</Text>
                                <Text style={styles.patternDetailsDesc}>Select a pattern to view details and dependencies</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f3ff' },
    innerContainer: { padding: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 0, justifyContent: 'center'},
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerIcon: { fontSize: 32, marginRight: 8 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#3730a3' },
    headerActionsRow: { flexDirection: 'row', gap: 8, marginBottom: 24, marginTop: 16, justifyContent: 'flex-start' },
    buttonGreen: { backgroundColor: '#22c55e', padding: 8, borderRadius: 8, marginRight: 8 },
    buttonBlue: { backgroundColor: '#3b82f6', padding: 8, borderRadius: 8, marginRight: 8 },
    buttonIndigo: { backgroundColor: '#6366f1', padding: 8, borderRadius: 8, marginRight: 8 },
    buttonIndigoSmall: { backgroundColor: '#6366f1', padding: 8, borderRadius: 8 },
    buttonGray: { backgroundColor: '#d1d5db', padding: 8, borderRadius: 8 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    addPatternContainer: { backgroundColor: '#eef2ff', borderRadius: 8, padding: 16, marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    inputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 8, backgroundColor: '#fff' },
    textarea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 8, backgroundColor: '#fff', minHeight: 48, marginBottom: 8 },
    prereqContainer: { marginBottom: 8 },
    label: { fontSize: 14, fontWeight: '500', color: '#64748b', marginBottom: 4 },
    prereqItem: { backgroundColor: '#f3f4f6', padding: 6, borderRadius: 8, marginRight: 4, marginBottom: 4 },
    prereqItemSelected: { backgroundColor: '#c7d2fe' },
    tagsContainer: { marginBottom: 8 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    tagItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ede9fe', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4, marginRight: 4, marginBottom: 4 },
    tagText: { color: '#7c3aed', fontSize: 12 },
    tagRemove: { color: '#7c3aed', fontSize: 16, marginLeft: 4 },
    buttonRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    patternsRow: { },
    patternListContainer: { },
    patternListScroll: { maxHeight: 400 },
    patternItem: { padding: 12, borderRadius: 8, borderWidth: 2, marginBottom: 8 },
    patternItemSelected: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
    patternItemUnselected: { borderColor: '#d1d5db', backgroundColor: '#fff' },
    patternItemHeader: { flexDirection: 'row', alignItems: 'center' },
    patternName: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
    patternTagsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    patternTag: { fontSize: 12, backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4 },
    deleteIcon: { fontSize: 20, color: '#ef4444', marginLeft: 8 },
    patternDetailsContainer: { marginTop: 16, marginLeft: 0, width: '100%' },
    patternDetails: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 2, borderColor: '#6366f1', padding: 16 },
    patternDetailsName: { fontSize: 20, fontWeight: 'bold', color: '#6366f1', marginBottom: 4 },
    patternDetailsDesc: { color: '#64748b', marginBottom: 8 },
    patternDetailsRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
    patternDetailsCol: { flex: 1 },
    patternDetailsValue: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    patternDetailsEmpty: { backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 2, borderColor: '#d1d5db', padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyIcon: { fontSize: 48, color: '#d1d5db', marginBottom: 8 },
    exampleContainer: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginTop: 24 },
    exampleScroll: { marginTop: 8 },
    exampleText: { fontFamily: 'monospace', color: '#22c55e', fontSize: 12 }
});

export default WCSPatternGraph;

