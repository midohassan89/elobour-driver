import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Brand } from '@/constants/colors';

type Props = {
  label: string;
  required?: boolean;
  uri: string | null;
  onChange: (uri: string | null) => void;
};

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.3,
  exif: false,
};

export function PhotoCapture({ label, required, uri, onChange }: Props) {
  // Local preview state so the image shows immediately after pick/capture
  const [imageUri, setImageUri] = useState<string | null>(uri ?? null);

  useEffect(() => {
    if (typeof uri === 'string' && uri.length > 0) {
      setImageUri(uri);
    } else if (uri == null) {
      // Only clear when parent explicitly clears (delete / reset category)
      setImageUri(null);
    }
  }, [uri]);

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'إذن الكاميرا',
        'يجب السماح بالوصول للكاميرا لالتقاط صور المصروف.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setImageUri(selectedUri);
      onChange(selectedUri);
    }
  }

  async function pickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'إذن المعرض',
        'يجب السماح بالوصول لمعرض الصور لاختيار صورة المصروف.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setImageUri(selectedUri);
      onChange(selectedUri);
    }
  }

  function clearImage() {
    setImageUri(null);
    onChange(null);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
        {!required ? <Text style={styles.optional}> (اختياري)</Text> : null}
      </Text>

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 10,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: 200,
            backgroundColor: '#E5E7EB',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}>
          <Text style={{ color: '#9CA3AF' }}>لا توجد صورة</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={[styles.actionBtn, styles.cameraBtn]} onPress={takePhoto}>
          <Ionicons name="camera" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>التقاط من الكاميرا</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.galleryBtn]}
          onPress={pickFromGallery}>
          <Ionicons name="images" size={18} color={Brand.primary} />
          <Text style={styles.galleryBtnText}>اختيار من المعرض</Text>
        </Pressable>
      </View>

      {imageUri ? (
        <Pressable style={styles.removeBtn} onPress={clearImage}>
          <Ionicons name="trash-outline" size={16} color={Brand.danger} />
          <Text style={styles.removeText}>حذف الصورة</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Brand.card,
    borderColor: Brand.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  label: {
    color: Brand.primary,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  required: {
    color: Brand.danger,
  },
  optional: {
    color: Brand.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  actionBtn: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row-reverse',
    gap: 6,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  cameraBtn: {
    backgroundColor: Brand.primary,
  },
  galleryBtn: {
    backgroundColor: Brand.surface,
    borderColor: Brand.primary,
    borderWidth: 1.5,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  galleryBtnText: {
    color: Brand.primary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  removeBtn: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row-reverse',
    gap: 6,
    paddingVertical: 4,
  },
  removeText: {
    color: Brand.danger,
    fontSize: 13,
    fontWeight: '700',
  },
});
